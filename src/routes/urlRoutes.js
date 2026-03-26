const { validateUrl } = require("../middlewares/validateUrl.js");
const auth = require("../middlewares/auth.js");
const {
  createUrl,
  redirectTO,
  urlInfo,
  deleteUrl,
} = require("../controllers/urlController.js");
const express = require("express");
const urlRouter = express.Router();

urlRouter.post("/url", auth, validateUrl, createUrl);
urlRouter.get("/:shortCode", redirectTO);
urlRouter.get("/url/:shortCode", auth, urlInfo);
urlRouter.delete("/url/:shortCode", auth, deleteUrl);

module.exports = urlRouter;
