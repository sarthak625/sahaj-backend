const express = require('express')
const router = express.Router()
const fs = require('fs')
const routesPath = `${__dirname}/`
const { removeExtensionFromFile } = require('../middleware/utils')

/*
 * Load routes statically and/or dynamically
 */

// Load Auth route
router.use('/', require('./auth'))

// Loop routes path and loads every file as a route except this file and Auth route
fs.readdirSync(routesPath).filter((file) => {
  // Take filename and remove last part (extension)
  const routeFile = removeExtensionFromFile(file)
  // Prevents loading of this file and auth file
  return routeFile !== 'index' && routeFile !== 'auth'
    ? router.use(`/${routeFile}`, require(`./${routeFile}`))
    : ''
})
// http://3.215.69.186:3000/users/redirect

/*
 * Setup routes for index
 */
router.get('/test', (req, res) => {
  res.send('index')
})

router.get('/', (req, res) => {
  res.render('index')
})

router.get('/login-with-email', (req, res) => {
  res.render('login-email')
})

router.get('/login-as-admin', (req, res) => {
  res.render('login-admin')
})

router.get('/login-page', (req, res) => {
  res.render('login-page')
})

router.get('/dashboard', (req, res) => {
  res.redirect('https://meet.meditatenow.org/')
})

router.get('/error', (req, res) => {
  res.send('redirected')
})

/*
 * Handle 404 error
 */
router.use('*', (req, res) => {
  res.status(404).json({
    errors: {
      msg: 'URL_NOT_FOUND'
    }
  })
})

module.exports = router
