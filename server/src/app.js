import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import { seedRoles } from "./seeds/seedRoles.js";
// import seed from "./seeds/seedRolesAndSuperadmin.js";
import workflowRoute from "./routes/workflowRoute.js";
import triggerRoutes from "./routes/triggerRoutes.js";
import publicWebhookRoutes from "./routes/publicWebhookRoutes.js";
import { loadSchedules } from "./services/scheduler.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import aiWorkflowRoutes from "./routes/aiWorkflowRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import superadminRoutes from "./routes/superadminRoutes.js";

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
app.use("/api/organizations", organizationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/workflows", workflowRoute);
app.use("/api/triggers", triggerRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiWorkflowRoutes);
app.use("/api/superadmin", superadminRoutes);

// Public Routes
app.use("/api/public/webhooks", publicWebhookRoutes);
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Autodesk server is running",
  });
});

// Loading Schedules
// loadSchedules();

// SEEDS
// seedRoles()
// seed; // Superadmin and roles seeding - 12/12/25

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong Globally!",
  });
});

export default app;
