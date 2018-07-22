const express = require('express')
const cheerio = require('cheerio')
const request = require('express')

const pkg = require('./package.json')

const app = express()

// META 
app.get('/meta/healthcheck', (req, res) => {
  return res.json({
    status: "ok"
  })
})

app.get('/meta/whoami', (req, res) => {
  return res.json({
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
  })
})

// Routes
app.get('/posts/:userId', (req, res) => {
  return res.json({
    requstedUserId: req.params.userId,
    posts: [
      {
        imageUrl: 'soon',
        comments: 'soon',
        location: 'soon',
        description: 'soon',
      },
      {
        imageUrl: 'soon',
        comments: 'soon',
        location: 'soon',
        description: 'soon',
      },
      {
        imageUrl: 'soon',
        comments: 'soon',
        location: 'soon',
        description: 'soon',
      },
    ],
  })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})