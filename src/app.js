import express from "express";
import apiRoutes from "./routes/index.js";
import { response } from "./utils/response.js";
import { deviceInfo } from "./middleware/deviceInfo.js";

const app = express();

app.use(express.json());
app.use(deviceInfo);

app.get("/health", (req, res) => response.success(res, "OK", { uptime: process.uptime() }));

app.use("/api", apiRoutes);

// 404
app.use((req, res) => response.error(res, "Not found", 404));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  response.error(res, err.message || "Internal server error", 500);
});

export default app;
