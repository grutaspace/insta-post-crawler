const express = require('express')
const axios = require('axios')
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

// ROUTES
app.get('/post/:userId', async function (req, res) {
  console.log(`Fetching data for user ${req.params.userId}...`)
  let noiceRes
  await axios.post('https://instaplan.herokuapp.com/graphql',{
    "operationName":"user",
    "variables": {
        "username": req.params.userId
    },
    "query":"query user($username: String!) {  user(username: $username) {\n    id\n    avatarUrl\n    name\n    bio\n    website\n    followers\n    following\n    posts\n    photos {\n      id\n      url\n      __typename\n    }\n    isPrivate\n    __typename\n  }\n}\n"
  }).then(oi => {
      let jsonSuccessRes, jsonResponse
      try {
        jsonSuccessRes = CircularJSON.stringify(oi)
      } catch (err) {
        console.log('[CRAWL 1] ERR: ', err)
        noiceRes = {
          status: 500,
          message: 'Error parsing circular json from api call...'
        }
      }
      // back to json
      try {
        jsonResponse = JSON.parse(jsonSuccessRes)
      } catch (err) {
        console.log('[XAUXAU 1] ERR: ', err)
        jsonResponse = {
          status: 500,
          message: 'Error parsing stringified circular json back to json...'
        }
      }

      if(jsonResponse.data){
        noiceRes = {
          status: 200,
          data: jsonResponse.data
        }
      } else {
        noiceRes = {
          status: 500,
          message: 'Something wrong happened, there was no data inside success respose from heroku app...'
        }
      }
      return noiceRes
  }).catch(xau => {
    console.log('error calling api ', xau.toString())
    noiceRes = {
      status: 503,
      message: 'Error calling herokuapp...',
      error: xau
    }
  })

  res.status(noiceRes.status).json(noiceRes)
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})