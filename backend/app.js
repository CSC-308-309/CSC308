import express from "express";
import cors from "cors";

export function createApp({ db }) {
  if (!db) throw new Error("createApp requires a 'db' dependency");

  const app = express();

  app.use(cors());
  app.use(express.json());

  // basic test
  app.get("/", (req, res) => res.send("Hello World!"));

  return app;
}
