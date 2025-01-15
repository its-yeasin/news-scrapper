import express from "express";
import cors from "cors";
import scrap from "./scrap.js";

const app = express();

app.use(cors());
app.use(express.json());

// SSE Route
app.get("/api/scrap", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const news = await scrap(res);
    res.json(news);
  } catch (e) {
    console.error("Error:", e);
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
