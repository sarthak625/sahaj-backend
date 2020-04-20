const controller = require('../controllers/users')
const validate = require('../controllers/users.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const path = require('path')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Users routes
 */

// =====================================
// GOOGLE ROUTES =======================
// =====================================
// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
  // trimRequest.all,
  // (req, res) => {
  //   res.status(200).send('hey')
  // }
)

// {
//   successRedirect: '/dashboard',
//   failureRedirect: '/error',
//   session: true
// }

// the callback after google has authenticated the user
router.get(
  '/redirect',
  passport.authenticate('google', {
    session: false
  }),
  (req, res) => {
    const user = res.req.user

    const jitsiToken = AuthController.createJitsiToken(
      '*',
      {
        email: user.google.email,
        name: user.google.email.split('@')[0]
      },
      '1d',
      true
    )

    if (req.session) {
      req.session.isLoggedIn = true
      req.session.jitsiToken = jitsiToken
    }
    res.render('dashboard', {
      jitsiToken
    })
  }
)

router.get('/css/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/css/style.css'))
})

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  controller.getItems
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)

/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.getItem,
  controller.getItem
)

/*
 * Update item route
 */
router.patch(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem
)

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router
