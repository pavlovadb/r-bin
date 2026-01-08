# RequestBin

Express app that listens for incoming HTTP requests and stores their data

React app displays list of baskets, the requests inside each basket, allow users to create new baskets and delete requests. Generates and displays a shortened URL endpoint for requests, such as webhooks to use

PostgreSQL will store method, url, headers, timestamp

MongoDB will store request body

## Local Setup

### Server

1. run
   ```bash
   cd server
   ```
1. run `npm ci` to install dependencies from package-lock.json
1. Install postgres (`brew install postgresql` on Mac) if you don't have it already

1. Copy `.env.example` to `.env` and replace `<USERNAME>` and `<PASSWORD>` with your database credentials.

1. Create a PostgreSQL database `requestbin` on your local machine by running `createdb requestbin`.

1. Run the database setup script:

   ```bash
   npm run setup-db
   ```

1. Install MongoDB if you don't have it already

   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   mongod --version
   ```

1. If this is your first time cloning the repo, create a data directory

   ```
   mkdir -p ./data/db
   ```

1. Start server. This command will concurrently start up mongoDB as well as the server application. Output from both is streamed to one terminal.

```
npm run start
```

### Client

1. run

   ```
   cd client
   ```

1. run `npm ci` to install dependencies from package-lock.json

1. run app

   ```
   npm run dev
   ```

1. Open http://localhost:5173/