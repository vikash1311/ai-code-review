require("dotenv").config();
const express = require("express");
const cors = require("cors");
const reviewRoutes = require("./routes/review");

const app = express();
const PORT = process.env.PORT || 8080;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? [process.env.FRONTEND_ORIGIN]
  : ["http://localhost:5173", "http://localhost:3000"]; // Vite + CRA defaults

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/review", reviewRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Error]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅  AI Code Review backend running on port ${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️   OPENAI_API_KEY is not set — reviews will fail.");
  }
});