import dotenv from "dotenv";
dotenv.config(); // MUST be first

import app from "./app.js";
import connectDB from "./config/db.js";

// Debug (optional)
console.log("ENV CHECK:", process.env.MONGO_URI ? "Loaded" : "Not Loaded");

// Connect DB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
