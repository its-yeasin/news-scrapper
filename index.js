import express from "express";
import cors from "cors";
import scrap from "./scrap.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Key middleware
app.use((req, res, next) => {
  if (req.path === "/test") {
    return next();
  }
  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

app.get("/test", (req, res) => {
  res.json("Hello world");
});

// SSE Route
app.get("/scrap", async (req, res) => {
  req.setTimeout(0); // disable timeout
  try {
    const news = await scrap();
    res.json(news);
  } catch (e) {
    console.error("Error:", e);
    res
      .status(500)
      .json({ error: "Internal server error", message: e.message });
  }
});

// Start the server
const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
