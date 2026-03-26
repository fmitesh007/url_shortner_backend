const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/userController.js");
const express = require("express");
const validateUser = require("../middlewares/validateUser.js");
const { userSchemaZod } = require("../utils/userValidater.js");
const userRouter = express.Router();

userRouter.post("/auth/register", validateUser(userSchemaZod), registerUser);
userRouter.post("/auth/login", validateUser(userSchemaZod), loginUser);
userRouter.post("/auth/logout", logoutUser);

module.exports = userRouter;
