const express = require("express");
const app = express();
require("dotenv").config();
const psqlServices = require("./db_services/postgres_services");
const mongoServices = require("./db_services/mongo_services");
const { mongo } = require("mongoose");

const PORT = 3000;

async function startServer() {

  try {
    await mongoServices.connectToMongoDB();
    await psqlServices.connectToPostgres()
  } catch (err) {
    console.error("Failed to start server due to a database connection error.");
    console.error(err);
    process.exit(1);
  }
}

startServer();

app.use(express.json());

// Helper to iterate over an array of requests and invoke an async function for each one. Used for fetching all the response bodys from mongo for an array of requests as well as cascading delete basket operation into mongo
async function serialForEach(array, asyncFn) {
  for (const element of array) {
    try {
      await asyncFn(element);
    } catch (err) {
      console.error(`async function failed: ${err.message}`)
    }
  }
}

// View all baskets
app.get("/api/basket", async (req, res) => {
  try {
    const result = await psqlServices.getAllBaskets();
    res.send(result);
  } catch (err) {
    console.error('GET /api/basket error');
    return res.status(500).send('Internal Server Error');
  }
});

// Create basket
// TODO: check for uniqueness of basket name
app.post("/api/basket/:key", async (req, res) => {
  const path = req.params.key;
  try {
    const pathExists = await psqlServices.basketExists(path);
    if (pathExists) {
      return res.status(409).send(`Basket ${path} already exists`);
    }

    console.log(`you are creating basket: ${req.params.key}`);
    const result = await psqlServices.createBasket(path);
    // sends back newly created basket
    return res.status(201).send(result);
  } catch (err) {
    console.error(`POST /api/basket/${path} error: `, err.message);
    return res.status(500).send('Internal Server Error');
  }
});

// View a basket
app.get("/api/basket/:key", async (req, res) => {
  const path = req.params.key;

  // Path validation
  if (typeof path !== 'string' || path.length === 0) {
    return res.status(400).send('Invalid basket key');
  }

  // Return object that combines postgres data and mongo body
  try {
    const basketRequests = await psqlServices.getRequestsForBasket(path);
    const mergedRequests = [];

    // Serially iterate over requests in basket
    await serialForEach(basketRequests, async (request) => {
      // Destructure for desired attributes
      const {
        basket_path_name,
        method, 
        header, 
        time_stamp, 
        mongodb_path
      } = request;

      const requestBody = mongodb_path ? 
                          await mongoServices.getRequestBody(mongodb_path) :
                          null;

      mergedRequests.push({
         basket_path_name,
         method, 
         header, 
         time_stamp,
         body: requestBody
      });

    })
    res.send(mergedRequests);
  } catch (err) {
    console.error(`GET /api/basket/${path} error: `, err.message);
    return res.status(500).send('Internal Server Error');
  }
  // const mergedRequests = await Promise.all(
  //   basketRequests.map(async request => {
  //     const mongoPath = request.mongodb_path;
  //     const requestBody = await mongoServices.getRequestBody(mongoPath);
  //     request.body = requestBody;
  //     return request;
  //   })
  // );
});

// Delete a basket
app.delete("/api/basket/:key", async (req, res) => {
  const path = req.params.key;

  try {
    const basketRequests = await psqlServices.getRequestsForBasket(path);
        
    // Iterate through basket requests and delete body from mongo
    await serialForEach(basketRequests, async (request) => {
      await mongoServices.deleteRequestBody(request.mongodb_path)
    })

    // Delete basket from postgres. Returns count of deleted rows
    const result = await psqlServices.deleteBasket(path); 

    // if rowCount is more than 1 , row was deleted
    if (result > 0) {
      res.send("Basket deleted");
    } else {
      res.status(404).send("Basket not Found.");
    }
  } catch (err) {
    console.error(`DELETE /api/basket/${path} error`);
    return res.status(500).send("Basket deletion error")
  }
});

// This route will handle all HTTP methods for the basket_path
//getting a request to a basket
app.all("/:path", async (req, res) => {
  try {
    const method = req.method;
    const path = req.path.replace("/", "");
    const headers = req.headers;
    const body = req.body || ""; // Used for POST, PUT, etc.

    // TODO: add if statement to handle case where there is no such request bin
    //const basket = await get
    const pathExists = await basketExists(path);
    if (!pathExists) return res.status(404).send(`Basket ${path} not found`);

    if (body) {
      // Store request body in MongoDB
      const savedRequestBody = await mongoServices.addRequestBody(body);
      // console.log(savedRequestBody._id)
      // Then store request metadata in PostgreSQL with MongoDB reference
      await psqlServices.addRequest(path, method, headers, savedRequestBody._id.toString());
    } else {
      await psqlServices.addRequest(path, method, headers, null);
    }
    // let test = await mongoServices.getRequestBody("68b764f1d9de2d9ad57bf964");
    // console.log(test);
    
    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling request:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// TODO: Increment total count for requests per basket

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
