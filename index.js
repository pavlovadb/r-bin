const express = require("express");
const app = express();
require("dotenv").config();
const psqlServices = require("./db_services/postgres_services");
const mongoServices = require("./db_services/mongo_services");

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

// View all baskets
app.get("/api/basket", async (req, res) => {
  const result = await psqlServices.getAllBaskets();
  res.send(result);
});

// Create basket
// TODO: check for uniqueness of basket name
app.post("/api/basket/:key", async (req, res) => {
  console.log(`you are creating basket: ${req.params.key}`);

  const path = req.params.key;
  const result = await psqlServices.createBasket(path);
  // sends back newly created basket
  res.send(result);
});

// View a basket
app.get("/api/basket/:key", async (req, res) => {
  const path = req.params.key;
  const basketRequests = await psqlServices.getRequestsForBasket(path);
  //basket request is an empty array if that basket is deleted and we are not getting an error or anything when we try to view a deleted basket
  //check this tomorrow 
  // return result
  res.send(basketRequests);
});

// Delete a basket
app.delete("/api/basket/:key", async (req, res) => {
  const path = req.params.key;
  const result = await psqlServices.deleteBasket(path); // returns row count of deleted rows

  // if rowCount is more than 1 , row was deleted
  if (result > 0) {
    res.send("Basket deleted");
  } else {
    res.status(404).send("Not Found.");
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
    // First, store the request body in MongoDB
    const savedRequestBody = await mongoServices.addRequestBody(body);
    
    // Then store the request metadata in PostgreSQL with the MongoDB reference
    console.log(savedRequestBody._id)
    const request = await psqlServices.addRequest(path, method, headers, savedRequestBody._id.toString());
    
    // let test = await mongoServices.getRequestBody("68b764f1d9de2d9ad57bf964");
    // console.log(test);
    
    res.sendStatus(200);
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// TODO: Increment total count for requests per basket

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
