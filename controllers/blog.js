const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const middleware = require("../utils/middleware");

blogRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", { name: 1, username: 1 });
  res.json(blogs);
});

blogRouter.post("/", middleware.userExtractor, async (req, res) => {
  if (!req.body.title || !req.body.url) {
    return res.status(400).json({ error: "Missing title or url" });
  }

  try {
    const blog = new Blog(req.body);
    blog.user = req.user;
    if (!blog.likes) blog.likes = 0;
    const result = await blog.save();

    const user = await User.findById(req.user._id);
    user.blogs = [...user.blogs, result._id];
    await user.save();

    res.status(201).json(result);
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({ error: "Unknown error" });
  }
});

blogRouter.delete("/:id", middleware.userExtractor, async (req, res) => {
  const user = req.user;
  const blogPost = await Blog.findById(req.params.id);

  if (blogPost.user.toString() !== user._id.toString()) {
    return res.status(401).json({ error: "invalid token" });
  }

  const dbUser = await User.findById(user._id);
  dbUser.blogs = dbUser.blogs.filter(
    (blogPost) => blogPost._id.toString() !== req.params.id
  );
  await dbUser.save();

  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

blogRouter.put("/:id", async (req, res) => {
  const result = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate("user", { username: 1, name: 1 });
  res.status(201).json(result);
});

module.exports = blogRouter;
