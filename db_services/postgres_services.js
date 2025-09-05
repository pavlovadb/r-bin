const { Client } = require("pg");

const pgClient = new Client({
  connectionString: process.env.REQUESTBIN_POSTGRES_URL,
});

async function connectToPostgres() {
  try {
    await pgClient.connect();
    console.log("Successfully connected to PostgreSQL");
  } catch (err) {
    console.error("Error connecting to PostgreSQL:");
    throw err;
  }
}

// get all baskets
async function getAllBaskets() {
  try {
    // query all baskets from `basket` table
    const result = await pgClient.query("SELECT * FROM basket");
    return result.rows;
  } catch (err) {
    console.error('Error getting all baskets');
    throw err;
  }
  
}

// create new basket
async function createBasket(path) {
  try {
    // make query to basket where path = req.params.key
    // RETRURN * means return newly inserted row
    const result = await pgClient.query("INSERT INTO basket (path_name) VALUES ($1) RETURNING *", [path]);
    return result.rows[0];
  } catch (err) {
    console.error("Error creating a new basket");
    throw err;
  }
}

// check if basket exists
async function basketExists(path) {
  const result = await pgClient.query(
    "SELECT 1 FROM basket WHERE path_name = $1 LIMIT 1",
    [path]
  );

  return result.rowCount > 0;
}

// list all requests from basket
async function getRequestsForBasket(basketPathName) {
  try {
    // query rows from `request` where `basket_enpoint_id` = `basketPathName`
    const result = await pgClient.query("SELECT * FROM request WHERE basket_path_name = $1", [basketPathName]);
    console.log(result.rows)
    return result.rows;
  } catch (err) {
    console.error("Error getting all requests for basket");
    throw err;
  }
}

// delete basket
async function deleteBasket(path) {
  try {
    // delete row from `basket` table where path = req.params.key
    const result = await pgClient.query("DELETE FROM basket WHERE path_name = $1", [path]);
    return result.rowCount;
  } catch (err) {
    console.error("Error deleting basket");
    throw err;
  }
}

//delete requests for basket 

//  add webhook requests to specified basket
async function addRequest(basketPathName, method, header, mongodbPath) {
  try {
    //add request to basket
    const result = await pgClient.query("INSERT INTO request (basket_path_name, method, header, mongodb_path) VALUES ($1, $2, $3, $4)", [basketPathName, method, header, mongodbPath]);
    return result.rows[0];
  } catch (err) {
    console.error("Error adding request to basket");
    throw err;
  }
}

async function deleteRequestsFromBasket(basketName) {
  const result = await pgClient.query("DELETE FROM request WHERE basket_path_name = $1", [basketName]);
}

module.exports = {
  connectToPostgres,
  getAllBaskets,
  createBasket,
  basketExists,
  getRequestsForBasket,
  deleteBasket,
  addRequest,
  deleteRequestsFromBasket
};
