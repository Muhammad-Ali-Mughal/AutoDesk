import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Autodesk server is running",
  });
});

// 404 handler
// app.use("/.*/", (req, res) => {
//   res.status(404).json({
//     error: "Route not found",
//   });
// });

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
  });
});

export default app;
