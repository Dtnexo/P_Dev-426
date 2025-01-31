const mysql = require("mysql2/promise");

const dbConfig = {
  host: "db_container",
  user: "root",
  password: "root",
  port: 3306,
  database: "db_app183",
};

async function queryDatabase(query) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Example query
    const [results] = await connection.query(`${query}`);
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

module.exports = { queryDatabase };
