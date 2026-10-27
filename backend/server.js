const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const {
  startDueReminderJob,
} = require("./jobs/dueReminderJob");

const authRoutes = require("./routes/authRoutes");
const creditScoreRoutes = require("./routes/creditScoreRoutes");
const creditHealthRoutes = require("./routes/creditHealthRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const loanRoutes = require("./routes/loanRoutes");
const creditImpactRoutes = require("./routes/creditImpactRoutes");
const emiRiskRoutes = require("./routes/emiRiskRoutes");
const creditReportExplainerRoutes = require("./routes/creditReportExplainerRoutes");
const paymentPreventionRoutes = require("./routes/paymentPreventionRoutes");
const cibilSimulatorRoutes = require("./routes/cibilSimulatorRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

// Daily due-date reminder scan (in-app notification + SMS).
startDueReminderJob();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Basic Routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CrediGuide Backend API is running",
    status: "online",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "CrediGuide Backend",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| Credit and Financial Features
|--------------------------------------------------------------------------
*/

app.use(
  "/api/credit-score",
  creditScoreRoutes
);

app.use(
  "/api/cibil-simulator",
  cibilSimulatorRoutes
);

app.use(
  "/api/credit-health",
  creditHealthRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/loans",
  loanRoutes
);

/*
|--------------------------------------------------------------------------
| AI and Prediction Features
|--------------------------------------------------------------------------
*/

app.use(
  "/api/credit-impact",
  creditImpactRoutes
);

app.use(
  "/api/emi-risk",
  emiRiskRoutes
);

app.use(
  "/api/credit-report-explainer",
  creditReportExplainerRoutes
);

app.use(
  "/api/payment-prevention",
  paymentPreventionRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message ||
      "Internal server error",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(
    `CrediGuide backend running on port ${PORT}`
  );

  console.log(
    `Local URL: http://localhost:${PORT}`
  );
});