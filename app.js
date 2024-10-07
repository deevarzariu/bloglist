const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const middleware = require("./utils/middleware");

const { MONGODB_URI } = require("./utils/config");

const blogRouter = require("./controllers/blog");
const userRouter = require("./controllers/user");

mongoose.connect(MONGODB_URI);

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);
app.use(middleware.errorHandler);

module.exports = app;
