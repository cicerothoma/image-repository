const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoutes");
const imageRoute = require("./routes/imageRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// MiddleWare for getting the data sent in the request body
app.use(express.json({ limit: "10kb" }));

// Form Parser (Parses data from an html form to the req.body)
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Middleware for parsing cookies
app.use(cookieParser());

// Middleware for enabling CORS (Cross Origin Request Sharing)
app.use(cors()); // Only works for simple requests (GET, POST)

// Middleware for enabling CORS for non-simple request (PATCH, PUT, DELETE, request with cookies etc)
app.options("*", cors());

// Routes

app.use("/api/v1/users", userRoute);
app.use("/api/v1/images", imageRoute);

// Unhandled Routes
app.all("*", (req, res, next) => {
  const error = `Can't find ${req.originalUrl} on this server`;

  next(new Error(error));
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(400).json({
    status: "fail",
    message: err.message,
  });
});

module.exports = app;
