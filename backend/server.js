import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";

const app = express();
const frontendDist = fileURLToPath(new URL("../frontend/dist", import.meta.url));
const PORT = Number(process.env.PORT || 5000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be a valid port number");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

if (
  !process.env.ADMIN_PASSWORD ||
  process.env.ADMIN_PASSWORD.length < 16 ||
  process.env.ADMIN_PASSWORD.toLowerCase().includes("change-me")
) {
  throw new Error("Set ADMIN_PASSWORD to a unique value at least 16 characters long");
}

if (
  !process.env.SESSION_SECRET ||
  process.env.SESSION_SECRET.length < 32 ||
  process.env.SESSION_SECRET.toLowerCase().includes("change-me")
) {
  throw new Error("Set SESSION_SECRET to a unique value at least 32 characters long");
}

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  );
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(express.json({ limit: "32kb" }));
app.get("/api/health", (req, res) => {
  const connected = Boolean(connectDB.isConnected());
  res.status(connected ? 200 : 503).json({
    success: connected,
    database: connected ? "connected" : "disconnected",
  });
});
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});
app.use(express.static(frontendDist, { index: false, maxAge: "1d" }));
app.use((req, res, next) => {
  if (req.method !== "GET" || !req.accepts("html")) {
    return next();
  }
  res.sendFile(path.join(frontendDist, "index.html"), (error) => {
    if (error) next(error);
  });
});
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  console.error("Unhandled request error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
});

async function startServer() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  const shutdown = () => {
    server.close(() => {
      connectDB.disconnect().finally(() => process.exit(0));
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
