const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
});

blogRouter.post("/", async (req, res) => {
  if (!req.body.title || !req.body.url) {
    return res.status(400).json("Missing title or url");
  }

  const blog = new Blog(req.body);
  if (!blog.likes) blog.likes = 0;

  const result = await blog.save();
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
