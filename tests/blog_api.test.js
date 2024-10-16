const { test, after, beforeEach, before, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");

const app = require("../app");
const Blog = require("../models/blog");
const User = require("../models/user");
const helper = require("../utils/api_helper");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const api = supertest(app);

const getToken = async () => {
  await User.deleteOne({ username: "johnny" });

  const user = new User({ name: "Johnny Guitar", username: "johnny" });
  user.passwordHash = await bcryptjs.hash(helper.initialPassword, 10);
  await user.save();

  const response = await api
    .post("/api/login")
    .send({ username: user.username, password: helper.initialPassword })
    .expect(200);

  return response.body.token;
};

describe("blogs API", () => {
  describe("fetch blog posts", () => {
    beforeEach(async () => {
      await Blog.deleteMany({});

      for (let blogPost of helper.initialBlogs) {
        const blogObj = new Blog(blogPost);
        await blogObj.save();
      }
    });

    test("returns the correct number of blog posts", async () => {
      const res = await api.get("/api/blogs").expect(200);

      assert.strictEqual(res.body.length, helper.initialBlogs.length);
    });

    test("the blog posts have the 'id' property", async () => {
      const res = await api.get("/api/blogs");
      const ids = res.body.map((blog) => blog.id);

      assert.ok(typeof ids[0] === "string");
      assert.ok(typeof ids[1] === "string");
    });
  });

  describe("create a blog post", () => {
    beforeEach(async () => {
      await Blog.deleteMany({});

      for (let blogPost of helper.initialBlogs) {
        const blogObj = new Blog(blogPost);
        await blogObj.save();
      }
    });

    test("successfully creates a blog post", async () => {
      const token = await getToken();

      await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${token}` })
        .send(helper.dummyBlogContent)
        .expect(201);

      const blogs = await helper.getAllBlogs();
      const blogTitles = blogs.map((blog) => blog.title);

      assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);
      assert.strictEqual(
        blogTitles.includes(helper.dummyBlogContent.title),
        true
      );
    });

    test("fails to create a blog post with an invalid token", async () => {
      const invalidToken = "";

      await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${invalidToken}` })
        .send(helper.dummyBlogContent)
        .expect(401);

      const blogs = await helper.getAllBlogs();
      const blogTitles = blogs.map((blog) => blog.title);

      assert.strictEqual(blogs.length, helper.initialBlogs.length);
      assert.strictEqual(
        blogTitles.includes(helper.dummyBlogContent.title),
        false
      );
    });

    test("creates a blog post with 0 likes if request body has no likes property", async () => {
      const token = await getToken();
      const { likes, ...content } = helper.dummyBlogContent;

      const result = await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${token}` })
        .send(content)
        .expect(201);
      const blogs = await helper.getAllBlogs();

      assert.strictEqual(result.body.likes, 0);
      assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);
    });

    test("fails to create blog post if no title provided", async () => {
      const token = await getToken();
      const content = {
        author: helper.dummyBlogContent.author,
        url: helper.dummyBlogContent.url,
      };

      await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${token}` })
        .send(content)
        .expect(400);
      const blogs = await helper.getAllBlogs();

      assert.strictEqual(blogs.length, helper.initialBlogs.length);
    });

    test("fails to create blog post if no url provided", async () => {
      const token = await getToken();
      const content = {
        title: helper.dummyBlogContent.title,
        author: helper.dummyBlogContent.author,
      };

      await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${token}` })
        .send(content)
        .expect(400);
      const blogs = await helper.getAllBlogs();

      assert.strictEqual(blogs.length, helper.initialBlogs.length);
    });
  });

  describe("delete a blog post", () => {
    const auth = {};

    before(async () => {
      await Blog.deleteMany({});

      auth.token = await getToken();
      const decodedToken = jwt.verify(auth.token, process.env.SECRET);

      for (let blogPost of helper.initialBlogs) {
        const blogObj = new Blog(blogPost);
        blogObj.user = decodedToken.id;
        await blogObj.save();
      }
    });

    test("successfully deletes a blog post using the user token associated with the post", async () => {
      const blogs = await helper.getAllBlogs();
      const blogToDelete = blogs[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect(204);

      const updatedBlogs = await helper.getAllBlogs();
      assert.strictEqual(updatedBlogs.length, blogs.length - 1);
    });

    test("fails to delete a blog post if invalid token", async () => {
      const blogs = await helper.getAllBlogs();
      const blogToDelete = blogs[0];
      const invalidToken = "";

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: `Bearer ${invalidToken}` })
        .expect(401);

      const updatedBlogs = await helper.getAllBlogs();
      assert.strictEqual(updatedBlogs.length, blogs.length);
    });
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
});

after(async () => {
  await mongoose.connection.close();
});
