const validUrl = require("valid-url");

const validateUrl = (req, res, next) => {
  const { originalUrl } = req.body;
  try {
    if (validUrl.isUri(originalUrl)) {
      console.log("Valid Url");
      next();
    } else {
      res.status(400).json({ message: "Invalid URL" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error validating URL" });
  }
};

module.exports = { validateUrl };
