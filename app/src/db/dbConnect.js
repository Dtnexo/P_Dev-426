import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost", 
  user: "root",
  password: "root",
  port: 6035,
  database: "db_unesco",
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