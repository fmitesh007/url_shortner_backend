const mongoose = require("mongoose");
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    unique: true,
  },
  shortUrl: {
    type: String,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  analytics: [
    {
      ip: String,
      userAgent: String,
      country: String,
      device: String,
      timestamp: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Url", urlSchema);
