const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { connectDB } = require("./src/config/db.js");
const urlRouter = require("./src/routes/urlRoutes.js");
const userRouter = require("./src/routes/userRoutes.js");
const shortRoute = require("./src/routes/shortRoute.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));
connectDB();

const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://url-shortner-backend-t53i.onrender.com",
];
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 100,
    message: "too many requests try again in 5 mins",
  }),
);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api", urlRouter);
app.use("/api", userRouter);
app.use("/", shortRoute);
module.exports = app;
