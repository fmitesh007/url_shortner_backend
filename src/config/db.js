const mongoose = require("mongoose");
require("dotenv").config();

const MONGOURL = process.env.MONGOURL;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(MONGOURL);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
