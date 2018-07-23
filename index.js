const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const request = require('request')
const CircularJSON = require('circular-json')

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

// PAGE FETCHER
const fetchPage = (userId) => {
  console.log('FETCHING PAGE USR ', userId)
  return axios.get(`https://www.instagram.com/${userId}`)
  .then((res) => {
      let stringRes
      try {
        stringRes = CircularJSON.stringify(res)
      } catch (err) {
        console.log('[CRAWL 1] ERR: ', err)
      }
      return stringRes
    }
  )
  .then((stringRes) => {
    let json
    try {
      json = JSON.parse(stringRes)
    } catch (err) {
      console.log('[CRAWL 2] ERR: ', err)
    }
    return json.data
  }
)
  .catch(err => console.log('error fetching profile page: ', err.toString()))
}

// ROUTES
app.get('/posts/:userId', async function (req, res) {
  console.log('req received to crawl usr ', req.params.userId)
  // TRY GET PAGE DATA FIRST
  let pageData = null
  try {
    pageData = await fetchPage(req.params.userId)
  } catch (err) {
    console.log('ERROR FETCHING PAGE: ', err.toString())
  }
  // IF THERE IS PAGE DATA, CHEERIO THE SHIT OUT OF IT
  if (pageData) {
    const $ = cheerio.load(pageData)
    let images
    try {
      images = $('img')
    } catch (err) {
      console.log('[CRAWL 3] ERR: ', err)
      res.json({
        requstedUserId: req.params.userId,
        message: "Error making cheerio stuff"
      })
      return
    }
    // circular again
    let square
    try {
      square = CircularJSON.stringify(images)
      json = JSON.parse(square)
    } catch (err) {
      console.log('[CRAWL 4] ERR: ', err)
      res.json({
        requstedUserId: req.params.userId,
        message: "Error parsing cheerio stuff"
      })
      return
    }
    res.json({
      requstedUserId: req.params.userId,
      pageData,
      images: json,
    })
  } else {
    res.json({
      requstedUserId: req.params.userId,
      message: "Error in cheerio method",
    })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})