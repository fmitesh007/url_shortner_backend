const { redirectTo } = require("../controllers/urlController.js");
const express = require("express");
const shortRoute = express.Router();
shortRoute.get("/:shortCode", redirectTo);

module.exports = shortRoute;
