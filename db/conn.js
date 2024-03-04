import mongoose from "mongoose";
import pg from "pg";

const { Pool } = pg;

const MONGODB_URI = "mongodb://mongo-primary:27017/mydatabase?replicaSet=rs0";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB replica set");
  })
  .catch((error) => {
    console.log(error);
  });

const pool = new Pool({
  user: "postgres",
  password: "admin",
  host: "postgresdb",
  port: 5432,
  database: "users",
});

export { pool };
