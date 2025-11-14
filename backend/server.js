//backend/server.js
import express from "express";

const app = express();
const port = process.env.PORT || 8000;

//middleware to parse json when sending requests
app.use(express.json());

//server health test  
app.get("/health", (req, res) => {
  res.send({ status: "Server is running" });
});

//placeholder for database connection (add later after yanitsa)
async function startServer() {
  try {
    //placeholder for DB init
    //example (later):
    //const db = await connectToPostgres();
    //app.locals.db = db;

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

