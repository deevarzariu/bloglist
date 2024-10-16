const Blog = require("../models/blog");
const User = require("../models/user");

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

const initialPassword = "1234";

const initialUsers = [
  {
    name: "default-user",
    username: "root",
  },
  {
    name: "anonymous",
    username: "anon",
  },
];

const dummyBlogContent = {
  title: "Dummy Title #3",
  author: "Dummy Author #3",
  url: "www.fake-url-3.com",
  likes: 3,
};

const getAllBlogs = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const getAllUsers = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  dummyBlogContent,
  initialBlogs,
  initialPassword,
  initialUsers,
  getAllBlogs,
  getAllUsers,
};
