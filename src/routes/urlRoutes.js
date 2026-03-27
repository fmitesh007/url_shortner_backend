const { validateUrl } = require("../middlewares/validateUrl.js");
const auth = require("../middlewares/auth.js");
const {
  createUrl,
  getAllUrls,
  getAnalytics,
  urlInfo,
  deleteUrl,
} = require("../controllers/urlController.js");
const express = require("express");
const urlRouter = express.Router();

urlRouter.get("/url", auth, getAllUrls);
urlRouter.post("/url", auth, validateUrl, createUrl);
urlRouter.get("/url/:shortCode/analytics", auth, getAnalytics);
urlRouter.get("/url/:shortCode", auth, urlInfo);
urlRouter.delete("/url/:shortCode", auth, deleteUrl);

module.exports = urlRouter;
