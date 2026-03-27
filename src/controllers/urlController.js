const Url = require("../models/urlModel");
const { nanoid } = require("nanoid");
const { redis } = require("../config/redis.js");
const { isExpired } = require("../utils/isExpired.js");
const { updateAnalytics } = require("../utils/updateAnalytics.js");

const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userID: req.user }).sort({ createdAt: -1 });
    const response = urls.map(u => ({
      _id: u._id,
      originalUrl: u.originalUrl,
      shortCode: u.shortCode,
      shortUrl: u.shortUrl,
      clicks: u.clicks,
      expiresAt: u.expiresAt,
      createdAt: u.createdAt,
      user: u.userID ? u.userID.toString() : undefined,
    }));
    return res.status(200).json(response);
  } catch (err) {
    console.log("getAllUrls error:", err);
    return res.status(500).json({ error: err.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode, userID: req.user });
    if (!url) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }
    const deviceMap = {};
    const countryMap = {};
    for (const entry of url.analytics || []) {
      deviceMap[entry.device] = (deviceMap[entry.device] || 0) + 1;
      countryMap[entry.country] = (countryMap[entry.country] || 0) + 1;
    }
    const devices = Object.entries(deviceMap).map(([device, count]) => ({ device, count }));
    const countries = Object.entries(countryMap).map(([country, count]) => ({ country, count }));
    return res.status(200).json({
      totalClicks: url.clicks,
      devices,
      countries,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

const createUrl = async (req, res) => {
  try {
    const { originalUrl, expiresAt } = req.body;
    console.log(expiresAt);
    const shortCode = req.body.customAlias ? req.body.customAlias : nanoid(7);
    if (await Url.findOne({ shortCode })) {
      return res.status(409).json({
        success: false,
        message: "alias not available",
      });
    }
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    await redis.set(shortCode, originalUrl, { ex: 60 * 60 * 24 });
    const newUrl = new Url({
      originalUrl,
      expiresAt,
      shortCode,
      shortUrl,
      createdAt: new Date(),
      userID: req.user,
    });
    console.log("createUrl -> saving with userID:", req.user, "shortCode:", shortCode);
    await newUrl.save();
    console.log("createUrl -> saved! _id:", newUrl._id, "userID:", newUrl.userID);
    res.status(201).json(newUrl);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const redirectTo = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const cachedUrl = await redis.get(shortCode);
    if (cachedUrl) {
      updateAnalytics(req, shortCode).catch(err => console.error("Analytics update failed:", err.message));
      return res.redirect(cachedUrl);
    }
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }
    if (isExpired(url)) {
      await redis.del(shortCode);
      return res.status(410).json({ success: false, message: "Link expired" });
    }
    updateAnalytics(req, shortCode).catch(err => console.error("Analytics update failed:", err.message));
    await redis.set(shortCode, url.originalUrl, { ex: 60 * 60 * 24 });
    return res.redirect(url.originalUrl);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
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
    await redis.del(shortCode);
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

module.exports = { createUrl, getAllUrls, getAnalytics, redirectTo, urlInfo, deleteUrl };
