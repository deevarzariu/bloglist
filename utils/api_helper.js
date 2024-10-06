const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "Dummy Title #1",
    author: "Dummy Author #1",
    url: "www.fake-url-1.com",
    likes: 10,
  },
  {
    title: "Dummy Title #2",
    author: "Dummy Author #2",
    url: "www.fake-url-2.com",
    likes: 5,
  },
];

const getAllBlogs = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = { initialBlogs, getAllBlogs };
