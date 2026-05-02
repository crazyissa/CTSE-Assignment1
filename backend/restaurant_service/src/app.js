const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const restaurantRoutes = require("./routes/restaurantRoutes");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Restaurant Service API is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Restaurant Service",
    message: "Restaurant Service is running",
  });
});

// Serve static images
app.use("/public", express.static(path.join(__dirname, "../public")));

// Restaurant routes
app.use("/api/restaurants", restaurantRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Restaurant Management Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Restaurant Service:", error.message);
    process.exit(1);
  }
};

startServer();