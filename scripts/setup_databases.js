// const bodyParser = require("body-parser"); // Unnecessary for this file right?
const { Client } = require("pg");
const fs = require("fs")
const mongoose = require("mongoose");
require("dotenv").config();

// Check for proper .env variables
const defaultDbUrl = process.env.DEFAULT_POSTGRES_URL;
const requestbinDbUrl = process.env.REQUESTBIN_POSTGRES_URL;
const requestbinDbName = process.env.REQUESTBIN_DB;

if (!defaultDbUrl || !requestbinDbUrl || !requestbinDbName) {
  throw new Error('Missing required environment variables. Check .env.');
}

// Connect as default postgres user, create requestbin database if needed
async function createDatabaseIfNeeded() {
  const client = new Client({ connectionString: defaultDbUrl });
  await client.connect();

  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [requestbinDbName]
  );

  if (result.rowCount === 0) {
    await client.query(`CREATE DATABASE ${requestbinDbName}`);
  }

  await client.end();
}

// Read setup.sql, connect to requestbin database, run setup.sql
async function createTables() {
  const sqlSchema = fs.readFileSync('setup.sql', 'utf8'); 
  const client = new Client({ connectionString: requestbinDbUrl });
  
  try {
    await client.connect();
    await client.query(sqlSchema);
    console.log("Connected to PostgreSQL, 'setup.sql' executed");
  } catch (err) {
    console.error("PostgreSQL connection/query error", err);
  }

  await client.end();
}

async function mongoSetup() {

}

async function main() {
  try {
    await createDatabaseIfNeeded();
    await createTables();
    console.log('Postgres setup complete');
  } catch (err) {
    console.error('Error setting up Postgres', err);
    process.exit(1);
  }
}

main();