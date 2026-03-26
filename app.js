const express = require("express");
const { connectDB } = require("./src/db/db.js");
const urlRouter = require("./src/routes/urlRoutes.js");
const userRouter = require("./src/routes/userRoutes.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
connectDB();

const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  // "https://ai-task-manager-7ax0.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
app.use(express.json());
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
app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api", urlRouter);
app.use("/api", userRouter);

module.exports = app;
