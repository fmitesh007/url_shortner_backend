const Url = require("../models/urlModel");
const { nanoid } = require("nanoid");
const geoip = require("geoip-lite");

const createUrl = async (req, res) => {
  try {
    const { originalUrl, expiresAt } = req.body;
    const shortCode = req.body.alias ? req.body.alias : nanoid(7);
    if (await Url.findOne({ shortCode })) {
      return res.status(409).json({
        success: false,
        message: "alias not available",
      });
    }
    const shortUrl = `${process.env.BASE_URL}/api/${shortCode}`;
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

const redirectTO = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }
    const currentDate = new Date(new Date().toISOString());
    const expDate = new Date(url.expiresAt);
    console.log(`current date is ${currentDate},
      exp date is ${expDate}
      `);
    if (currentDate.getTime() >= expDate.getTime()) {
      console.log("expired");
      return res.status(410).json({
        success: false,
        message: "Link expired",
      });
    }
    const userAgent = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";
    const geo = geoip.lookup(ip === "::1" ? "8.8.8.8" : ip);
    const country = geo ? geo.country : "Unknown";
    console.log(`ip is ${ip}, geo is ${geo}, country is ${country}`);
    await Url.updateOne(
      { shortCode },
      {
        $inc: { clicks: 1 },
        $push: { analytics: { device, country, timestamp: new Date() } },
      },
    );
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

module.exports = { createUrl, redirectTO, urlInfo, deleteUrl };
