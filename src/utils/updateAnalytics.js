const geoip = require("geoip-lite");
const Url = require("../models/urlModel");
const updateAnalytics = async (req, shortCode) => {
  try {
    const userAgent = req.headers["user-agent"] || "";
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress || "";
    const cleanIp = ip.replace(/^::ffff:/, "");
    const device = /mobile|android|iphone/i.test(userAgent)
      ? "mobile"
      : "desktop";
    const geo = geoip.lookup(cleanIp);
    const country = geo?.country || "Unknown";
    await Url.updateOne(
      { shortCode },
      {
        $inc: { clicks: 1 },
        $push: {
          analytics: {
            ip: cleanIp,
            userAgent,
            device,
            country,
            timestamp: new Date(),
          },
        },
      },
    );
  } catch (err) {
    console.error("Analytics error:", err.message);
  }
};

module.exports = { updateAnalytics };
