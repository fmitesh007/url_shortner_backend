const validUrl = require("valid-url");

const validateUrl = (req, res, next) => {
  const { originalUrl, customAlias } = req.body;
  try {
    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    if (customAlias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
        return res.status(400).json({
          message: "Custom alias can only contain letters, numbers, underscores and hyphens",
        });
      }
      if (customAlias.length > 20) {
        return res.status(400).json({ message: "Custom alias must be 20 characters or less" });
      }
    }

    console.log("Valid Url");
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error validating URL" });
  }
};

module.exports = { validateUrl };
