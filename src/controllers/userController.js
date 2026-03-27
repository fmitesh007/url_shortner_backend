const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWTSECERET);
    res.cookie("token", token);
    return res.status(201).json({
      message: "User created",
      token,
      user: { name: user.name, email: user.email, _id: user._id },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User doesnt exist" });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Wrong password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWTSECERET);
    res.cookie("token", token);
    console.log("loginUser -> userId:", user._id, "token:", token.slice(0, 20) + "...");
    return res.json({
      message: "User signed in",
      token,
      user: { name: user.name, email: user.email, _id: user._id },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
