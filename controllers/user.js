const userRouter = require("express").Router();
const bcryptjs = require("bcryptjs");
const User = require("../models/user");

userRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
  });
  res.json(users);
});

userRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "password required" });
  }

  if (password.length < 3) {
    return res
      .status(400)
      .json({ error: "password must be at least 3 characters long" });
  }

  const saltRounds = 10;
  const passwordHash = await bcryptjs.hash(password, saltRounds);
  const user = new User({ name, username, passwordHash });

  const result = await user.save();
  res.status(201).json(result);
});

module.exports = userRouter;
