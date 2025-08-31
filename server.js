const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { Client } = require("pg");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = 3000;

const pgClient = new Client({
  user: "postgres",
  host: "localhost",
  password: "password",
  database: "requestbin",
  port: 5432,
});

async function startServer() {
  try {
    await pgClient.connect();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("PostgreSQL connection error");
  }

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
  const result = await pgClient.query("SELECT id FROM basket WHERE path=$1", [
    path.replace("/", ""),
  ]);

  //TODO: add if statement to handle case where there is no such request bin
  const basketId = result.rows[0].id;

  // Find body ref in mongoDB
  const mongodbPath = "pretend this is a ref to mongoDB";

  pgClient.query(
    "INSERT INTO request (basket_endpoint_id, method, header,  mongodb_path) values ($1, $2, $3, $4)",
    [basketId, method, header, mongodbPath]
  );

  res.send({});
});

// Create basket
app.post("/api/basket/:key", (req, res) => {
  console.log(`you are creating basket: ${req.params.key}`);

  const path = req.params.key;

  pgClient.query("INSERT INTO basket (endpoint_id) VALUES ($1)", [path]);

  res.send({});
});

app.get("/api/basket", (req, res) => {
  // TODO: I need to generate the url with key
  console.log("you requested a basket");
  res.send({});
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
