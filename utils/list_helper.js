const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (!blogs.length) return null

  const maxBlog = {
    title: blogs[0].title,
    author: blogs[0].author,
    likes: blogs[0].likes,
  }

  for (let blog of blogs) {
    if (blog.likes > maxBlog.likes) {
      maxBlog.title = blog.title
      maxBlog.author = blog.author
      maxBlog.likes = blog.likes
    }
  }

  return maxBlog
}

const mostBlogs = (blogs) => {
  if (!blogs.length) return null

  const blogsByAuthorMap = _.countBy(blogs, 'author')

  const blogsByAuthorArr = Object.entries(blogsByAuthorMap).map(
    ([author, blogs]) => ({
      author,
      blogs,
    })
  )

  return _.maxBy(blogsByAuthorArr, (item) => item.blogs)
}

const mostLikes = (blogs) => {
  if (!blogs.length) return null

  const groupedBlogs = _.groupBy(blogs, 'author')

  const likesPerAuthor = Object.entries(groupedBlogs).map(
    ([author, authorsBlogs]) => ({
      author,
      likes: totalLikes(authorsBlogs),
    })
  )

  return _.maxBy(likesPerAuthor, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
