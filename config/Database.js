import mysql from "mysql2/promise";
import dotenv from 'dotenv';
dotenv.config()
let connection = null;
const DbConnection = async () => {
    connection = await mysql.createPool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    console.log("Connected to the database successfully.");
  return connection;
};

export default DbConnection;
