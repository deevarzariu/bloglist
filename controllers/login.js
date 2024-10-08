const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "missing username or password" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: "user not found" });
  }

  const isPasswordCorrect = await bcryptjs.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res.status(401).json({ error: "invalid password" });
  }

  const userForToken = { username, id: user._id };
  const token = jwt.sign(userForToken, process.env.SECRET);

  res.status(200).json({ token, username, name: user.name });
});

module.exports = loginRouter;
