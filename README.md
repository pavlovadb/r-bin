# RequestBin

Express app that listens for incoming HTTP requests and stores data

PostgreSQL will store method, url, headers, timestamp

MongoDB will store request body

## Local Setup

1. run `npm ci` to install dependencies from package-lock.json
1. Install postgres (`brew install postgresql` on Mac) if you don't have it already

1. Copy `.env.example` to `.env` and replace `<USERNAME>` and `<PASSWORD>` with your database credentials.

1. Run the database setup script:
    ```
    npm run setup-db
    ```
    This will:
    - Create the `requestbin` PostgreSQL database if it doesn't exist.
    - Drop/recreate tables and seed initial data in PostgreSQL.

1. Install MongoDB if you don't have it already

    ```
    brew tap mongodb/brew
    brew install mongodb-community
    mongod --version
    ```

1. If this is your first time cloning the repo, create a 

    ```
    mkdir -p ./data/db
    ```
1. Start MongoDB with the above data path (it connects on port 27017)
    ```
    mongod --dbpath=./data/db
    ```

1. Start server
  `npm run start`
