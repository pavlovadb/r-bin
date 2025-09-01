const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// const { Client } = require("pg");
const mongoose = require("mongoose");
require("dotenv").config();
const {
  getAllBaskets,
  createBasket,
  getRequestsForBasket,
  deleteBasket,
  addRequest,
} = require("./postgresService");

const PORT = 3000;

// const pgClient = new Client({
//   connectionString: process.env.REQUESTBIN_POSTGRES_URL,
// });

async function startServer() {
  // try {
  //   await pgClient.connect();
  //   console.log("Connected to PostgreSQL");
  // } catch (err) {
  //   console.error("PostgreSQL connection error");
  // }

  try {
    await mongoose.connect("mongodb://localhost:27017/requestbin");

    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:");
  }
}

startServer();

app.use(express.json());

// View all baskets
app.get("/api/basket", async (req, res) => {
  const result = await getAllBaskets();
  res.send(result);
});

// Create basket
// TODO: check for uniqueness of basket name
app.post("/api/basket/:key", async (req, res) => {
  console.log(`you are creating basket: ${req.params.key}`);

  const path = req.params.key;
  const result = await createBasket(path);
  // sends back newly created basket
  res.send(result);
});

// View a basket
app.get("/api/basket/:key", async (req, res) => {
  const path = req.params.key;
  const basketRequests = await getRequestsForBasket(path);

  // return result
  res.send(basketRequests);
});

// Delete a basket
app.delete("/api/basket/:key", async (req, res) => {
  const path = req.params.key;
  const result = await deleteBasket(path); // returns row count of deleted rows

  // if rowCount is more than 1 , row was deleted
  if (result > 0) {
    res.send("Basket deleted");
  } else {
    res.status(404).send("Not Found.");
  }
});

// This route will handle all HTTP methods for the basket_path
// TODO: figure mongoDB
app.all("/:path", async (req, res) => {
  const method = req.method;
  const path = req.path.replace("/", "");
  const header = req.headers;
  const body = req.body; // Used for POST

  // Pretend a GET just came in

  //TODO: add if statement to handle case where there is no such request bin
  // Find body ref in mongoDB
  const mongodbPath = "pretend this is a ref to mongoDB";

  const request = await addRequest(path, method, header, mongodbPath);
  res.sendStatus(200);
});

// TODO: Increment total count for requests per basket

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
