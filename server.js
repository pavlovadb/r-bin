const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// const { Client } = require("pg");
const mongoose = require("mongoose");
require("dotenv").config();
const {
  getAllBaskets,
  createBasket,
  getBasketByPath,
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

// This route will handle all HTTP methods for the basket_path
app.all("/:path", async (req, res) => {
  const method = req.method;
  const path = req.path;
  const header = req.headers;
  const body = req.body; // Use for POST

  // Pretend a GET just came in
  // Query Postgres to find path id
  const result = await getBasketByPath(path.replace("/", ""));

  //TODO: add if statement to handle case where there is no such request bin
  const basketId = result.id;

  // Find body ref in mongoDB
  const mongodbPath = "pretend this is a ref to mongoDB";

  const request = await addRequest(basketId, method, header, mongodbPath);
  console.log("recieved a reqeuest to path", req.path);
  res.send(request);
});

// VIEW ALL BASKETS
app.get("/api/baskets", async (req, res) => {
  const result = await getAllBaskets();
  res.send(result);
});

// Create basket
app.post("/api/basket/:key", async (req, res) => {
  console.log(`you are creating basket: ${req.params.key}`);

  const path = req.params.key;
  const result = await createBasket(path);
  // sends back newly created basket
  res.send(result);
});

// VIEW A BASKET and its requests
app.get("/api/basket/:key", async (req, res) => {
  const path = req.params.key;
  const basket = await getBasketByPath(path);
  const basketId = basket.id;

  const basketRequests = await getRequestsForBasket(basketId);

  // return result
  res.send(basketRequests);
});

// DELETE a basket
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

app.get("/api/basket", (req, res) => {
  // TODO: I need to generate the url with key
  console.log("you requested a basket");
  res.send({});
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
