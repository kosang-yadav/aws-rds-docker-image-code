// Import necessary modules
const express = require("express"); // Express.js for creating the server
const cors = require("cors"); // CORS middleware to allow cross-origin requests
const path = require("path"); // Node.js 'path' module for working with file and directory paths
const config = require("dotenv").config();

// IMPORTANT: Choose ONE of the following database drivers based on your RDS instance type:
// For PostgreSQL RDS:
const { Pool } = require("pg");
// For MySQL RDS:
// const mysql = require('mysql2/promise');

// Initialize the Express application
const app = express();
// Define the port for the backend server to listen on
// For Docker, you might expose port 80 or 3000.
const port = process.env.PORT || 3000; // Use environment variable PORT or default to 3000

// Middleware setup
// Enable CORS for all origins.
// In a production environment, you MUST restrict this to specific origins (e.g., your frontend's domain).
// Example: app.use(cors({ origin: 'http://your-frontend-domain.com' }));
app.use(cors());
// Parse incoming request bodies as JSON. This is essential for handling form data.
app.use(express.json());

// --- Serve Static Frontend Files ---
// This line tells Express to serve static files (like your index.html, CSS, JS)
// from the 'public' directory.
// You MUST place your index.html (and any other frontend assets) inside a folder named 'public'
// in the root of your Node.js backend project.
app.use(express.static(path.join(__dirname, "public")));
console.log(`Serving static files from: ${path.join(__dirname, "public")}`);

// --- AWS RDS Database Configuration ---
// This is the most critical section. Replace these placeholder values with your actual RDS credentials and configuration.
// For production environments, NEVER hardcode sensitive credentials directly in your code.
// Instead, use environment variables (e.g., process.env.DB_HOST) or a secrets management service (e.g., AWS Secrets Manager).
const dbConfig = {
  host: process.env.DB_HOST || "YOUR_RDS_ENDPOINT", // Use environment variable or placeholder
  user: process.env.DB_USER || "YOUR_DB_USERNAME", // Use environment variable or placeholder
  password: process.env.DB_PASSWORD || "YOUR_DB_PASSWORD", // Use environment variable or placeholder
  database: process.env.DB_NAME || "YOUR_DB_NAME", // Use environment variable or placeholder
  port: process.env.DB_PORT || 5432, // Default for PostgreSQL (5432) or MySQL (3306)
  // For production, configure SSL carefully.
  // If your RDS requires SSL and you're not using a self-signed cert, you might need to provide CA certificates.
  // For testing, rejectUnauthorized: false might be used, but it's INSECURE for production.
  ssl: {
    rejectUnauthorized: false, // Set to true in production with proper CA certs
  },
};

// --- Database Connection Pool ---
// Using a connection pool is highly recommended for managing database connections efficiently.
// It reuses connections, reducing overhead and improving performance.
let pool;
try {
  // Uncomment and configure the appropriate pool based on your RDS database type.
  // For PostgreSQL (using 'pg' module):
  pool = new Pool(dbConfig);

  // For MySQL (using 'mysql2/promise' module):
  // pool = mysql.createPool(dbConfig);

  // Test database connection (optional, but good for initial debugging)
  pool
    .connect()
    .then((client) => {
      console.log("Successfully connected to AWS RDS!");
      client.release(); // Release the client back to the pool
    })
    .catch((err) => {
      console.error("Error connecting to AWS RDS:", err.stack);
      // In a real application, you might want to gracefully shut down or retry
    });
} catch (error) {
  console.error("Failed to initialize database pool:", error);
  // In a real application, you might not want to exit immediately, but handle this gracefully.
  // process.exit(1); // Exit if database connection cannot be established
}

// Ensure Users Table Exists ---
async function ensureUsersTableExists() {
  let createTableSql;
  // Determine SQL based on database type
  if (dbConfig.port === 5432) {
    // Assuming PostgreSQL
    createTableSql = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
  } else if (dbConfig.port === 3306) {
    // Assuming MySQL
    createTableSql = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
  } else {
    console.error("Unknown database port. Cannot create table automatically.");
    return;
  }

  try {
    await pool.query(createTableSql); // Use pool.query for both pg and mysql2/promise
    console.log("Database table 'users' ensured to exist.");
  } catch (error) {
    console.error("Error ensuring 'users' table exists:", error);
    // Depending on your strategy, you might want to exit the app if table creation fails
    // process.exit(1);
  }
}

// --- API Endpoint for Form Submission ---
// This defines a POST route at '/submit-form' to handle incoming form data from the frontend.
app.post("/submit-form", async (req, res) => {
  // Destructure username and email from the request body.
  // The frontend sends this data as JSON.
  const { username, email } = req.body;

  // Basic server-side validation of incoming data.
  // This is crucial even if frontend validation exists, as frontend validation can be bypassed.
  if (!username || !email) {
    // Respond with a 400 Bad Request if data is missing.
    return res
      .status(400)
      .json({ message: "Username and email are required." });
  }

  console.log(`Received submission: Username - ${username}, Email - ${email}`);

  await ensureUsersTableExists();

  // --- Database Insertion Logic ---
  // This is where the data is securely inserted into your AWS RDS database.
  try {
    // Example for PostgreSQL (using 'pg' module):
    // Ensure your 'users' table has 'username' (e.g., VARCHAR) and 'email' (e.g., VARCHAR) columns.
    const queryText =
      "INSERT INTO users(username, email) VALUES($1, $2) RETURNING *";
    const values = [username, email]; // Parameters are passed as an array for security (prevents SQL injection)
    const result = await pool.query(queryText, values);
    console.log("Data inserted into RDS:", result.rows[0]);

    // Example for MySQL (using 'mysql2/promise' module):
    // const [rows] = await pool.execute(
    //   'INSERT INTO users (username, email) VALUES (?, ?)',
    //   [username, email]
    // );
    // console.log('Data inserted into RDS, affected rows:', rows.affectedRows);

    // Respond to the frontend with a success message.
    res
      .status(200)
      .json({ message: "Form data received and saved to RDS successfully!" });
  } catch (error) {
    // Log the error for debugging purposes.
    console.error("Error inserting data into RDS:", error);
    // Respond with a 500 Internal Server Error if something goes wrong with the database operation.
    res
      .status(500)
      .json({
        message: "Failed to save data to the database. Please try again.",
      });
  }
});

// --- Catch-all for any other routes (serves index.html for SPAs) ---
// This ensures that if a user navigates directly to a path not explicitly defined,
// the index.html is served, allowing client-side routing to take over if applicable.
// For this simple form, it just ensures any non-API request loads the form.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Make the Express app listen for incoming requests on the specified port.
app.listen(port, () => {
  console.log(`Node.js backend server running on port ${port}`);
  console.log("Waiting for form submissions...");
  console.log(`Access the form at: http://localhost:${port}`);
});
