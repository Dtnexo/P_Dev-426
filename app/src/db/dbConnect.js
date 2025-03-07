import mysql from "mysql2/promise";
import { configDotenv } from "dotenv";

configDotenv();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
};

async function queryDatabase(query, params) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Example query
    const [results] = await connection.query(query, params);
    return results;
  } catch (error) {
    console.error("Database query failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export { queryDatabase };
