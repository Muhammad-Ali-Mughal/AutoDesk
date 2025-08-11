import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
