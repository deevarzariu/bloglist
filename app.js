const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const { MONGODB_URI } = require("./utils/config");

const blogRouter = require("./controllers/blog");

mongoose.connect(MONGODB_URI);

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogRouter);

module.exports = app;
