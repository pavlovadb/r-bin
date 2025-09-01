const { Client } = require("pg");
const pgClient = new Client({
  connectionString: process.env.REQUESTBIN_POSTGRES_URL,
});

async function connectPostgres() {
  try {
    await pgClient.connect();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    process.exit(1);
  }
}
connectPostgres();

// get all baskets
async function getAllBaskets() {
  // query all baskets from `basket` table
  const result = await pgClient.query("SELECT * FROM basket");
  return result.rows;
}

// create new basket
async function createBasket(path) {
  // make query to basket where path = req.params.key
  // RETRURN * means return newly inserted row
  const result = await pgClient.query(
    "INSERT INTO basket (path_name) VALUES ($1) RETURNING *",
    [path]
  );
  return result.rows[0];
}

// list all requests from basket
async function getRequestsForBasket(basketPathName) {
  // query rows from `request` where `basket_enpoint_id` = `basketPathName`
  const result = await pgClient.query(
    "SELECT * FROM request WHERE basket_path_name = $1",
    [basketPathName]
  );
  return result.rows;
}

// delete basket
async function deleteBasket(path) {
  // delete row from `basket` table where path = req.params.key
  const result = await pgClient.query(
    "DELETE FROM basket WHERE path_name = $1",
    [path]
  );
  return result.rowCount;
}
//  add webhook requests to specified basket
async function addRequest(basketPathName, method, header, mongodbPath) {
  const result = await pgClient.query(
    "INSERT INTO request (basket_path_name, method, header, mongodb_path) VALUES ($1, $2, $3, $4)",
    [basketPathName, method, header, mongodbPath]
  );

  return result.rows[0];
}

module.exports = {
  getAllBaskets,
  createBasket,
  getRequestsForBasket,
  deleteBasket,
  addRequest,
};
