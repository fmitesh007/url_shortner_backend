const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  let token = req.cookies?.token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    return res.status(401).json({ message: "Login please" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWTSECERET);
    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};
