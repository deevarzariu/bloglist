const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");

const app = require("../app");
const Blog = require("../models/blog");
const helper = require("../utils/api_helper");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blogPost of helper.initialBlogs) {
    const blogObj = new Blog(blogPost);
    await blogObj.save();
  }
});

test("returns the correct number of blog posts", async () => {
  const res = await api.get("/api/blogs");
  assert.strictEqual(res.body.length, helper.initialBlogs.length);
});

test("the blog posts have the 'id' property", async () => {
  const res = await api.get("/api/blogs");
  const ids = res.body.map((blog) => blog.id);

  assert.ok(typeof ids[0] === "string");
  assert.ok(typeof ids[1] === "string");
});

test("successfully creates a blog post", async () => {
  const content = {
    title: "Dummy Title #3",
    author: "Dummy Author #3",
    url: "www.fake-url-3.com",
    likes: 3,
  };

  await api.post("/api/blogs").send(content).expect(201);

  const blogs = await helper.getAllBlogs();
  const blogTitles = blogs.map((blog) => blog.title);

  assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);
  assert.strictEqual(blogTitles.includes("Dummy Title #3"), true);
});

test("if the likes property is missing from the request, successfully creates a blog post with 0 likes", async () => {
  const content = {
    title: "Dummy Title #3",
    author: "Dummy Author #3",
    url: "www.fake-url-3.com",
  };

  const result = await api.post("/api/blogs").send(content).expect(201);
  const blogs = await helper.getAllBlogs();

  assert.strictEqual(result.body.likes, 0);
  assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);
});

test("blog post creation fails with code 400 if no title provided", async () => {
  const content = {
    author: "Dummy Author #3",
    url: "www.fake-url-3.com",
  };

  await api.post("/api/blogs").send(content).expect(400);
  const blogs = await helper.getAllBlogs();

  assert.strictEqual(blogs.length, helper.initialBlogs.length);
});

test("blog post creation fails with code 400 if no url provided", async () => {
  const content = {
    title: "Dummy Title #3",
    author: "Dummy Author #3",
  };

  await api.post("/api/blogs").send(content).expect(400);
  const blogs = await helper.getAllBlogs();

  assert.strictEqual(blogs.length, helper.initialBlogs.length);
});

test("successfully deletes a blog post", async () => {
  const blogs = await helper.getAllBlogs();
  const blogToDelete = blogs[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  const updatedBlogs = await helper.getAllBlogs();
  assert.strictEqual(updatedBlogs.length, blogs.length - 1);
});

test("successfully updates a blog post", async () => {
  const blogs = await helper.getAllBlogs();
  const blogToUpdate = blogs[0];
  const likedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 };

  const result = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(likedBlog)
    .expect(201);

  assert.strictEqual(result.body.likes, blogToUpdate.likes + 1);
});

after(async () => {
  await mongoose.connection.close();
});
