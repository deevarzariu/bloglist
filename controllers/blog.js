const jwt = require("jsonwebtoken");
const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", { name: 1, username: 1 });
  res.json(blogs);
});

blogRouter.post("/", async (req, res) => {
  if (!req.body.title || !req.body.url) {
    return res.status(400).json("Missing title or url");
  }

  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!decodedToken.id) {
    return res.status(401).json({ error: "invalid token" });
  }

  const user = await User.findById(decodedToken.id);

  const blog = new Blog(req.body);

  if (!blog.likes) blog.likes = 0;

  if (!blog.user) {
    const user = await User.findOne({});
    blog.user = user._id;
  }

  const result = await blog.save();
  user.blogs = [...user.blogs, result._id];
  user.save();

  res.status(201).json(result);
});

blogRouter.delete("/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

blogRouter.put("/:id", async (req, res) => {
  const result = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(201).json(result);
});

module.exports = blogRouter;
