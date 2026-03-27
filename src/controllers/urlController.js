const Url = require("../models/urlModel");
const { nanoid } = require("nanoid");
const { redis } = require("../config/redis.js");
const { isExpired } = require("../utils/isExpired.js");
const { updateAnalytics } = require("../utils/updateAnalytics.js");

const createUrl = async (req, res) => {
  try {
    const { originalUrl, expiresAt } = req.body;
    console.log(expiresAt);
    const shortCode = req.body.alias ? req.body.alias : nanoid(7);
    if (await Url.findOne({ shortCode })) {
      return res.status(409).json({
        success: false,
        message: "alias not available",
      });
    }
    const shortUrl = `${process.env.BASE_URL}/api/${shortCode}`;
    await redis.set(shortUrl, originalUrl, { ex: 60 * 60 * 24 });
    const newUrl = new Url({
      originalUrl,
      expiresAt,
      shortCode,
      shortUrl,
      createdAt: new Date(),
    });
    await newUrl.save();
    res.status(201).json(newUrl);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const redirectTo = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    const cachedUrl = await redis.get(shortUrl);
    if (cachedUrl) {
      console.log("Cache HIT");
      return res.redirect(cachedUrl);
    }
    console.log("Cache MISS");
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    if (isExpired(url)) {
      console.log("expired");
      await redis.del(shortCode);
      return res.status(410).json({
        success: false,
        message: "Link expired",
      });
    }
    updateAnalytics(req, shortCode);
    await redis.set(shortUrl, url.originalUrl, { ex: 60 * 60 * 24 });
    return res.redirect(url.originalUrl);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const urlInfo = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: url,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    await redis.del(shortUrl);
    const url = await Url.findOneAndDelete({ shortCode });
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { createUrl, redirectTo, urlInfo, deleteUrl };
