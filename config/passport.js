/* eslint-disable max-statements */
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

const User = require('../app/models/user')
const AuthorizedDomains = require('../app/models/authorizedDomains')

const auth = require('../app/middleware/auth')
const JwtStrategy = require('passport-jwt').Strategy

/**
 * Extracts token from: header, body or query
 * @param {Object} req - request object
 * @returns {string} token - decrypted token
 */
const jwtExtractor = (req) => {
  let token = null
  if (req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '').trim()
  } else if (req.body.token) {
    token = req.body.token.trim()
  } else if (req.query.token) {
    token = req.query.token.trim()
  }
  if (token) {
    // Decrypts token
    token = auth.decrypt(token)
  }
  return token
}

/**
 * Options object for jwt middlware
 */
const jwtOptions = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: process.env.JWT_SECRET
}

/**
 * Login with JWT middleware
 */
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload.data._id, (err, user) => {
    if (err) {
      return done(err, false)
    }
    return !user ? done(null, false) : done(null, user)
  })
})

passport.use(jwtLogin)

/**
 * Login with Google
 */

// AuthorizedDomains.find({}).then(console.log).catch(console.log)
// User.find({}).then(console.log).catch(console.log)

const googleLogin = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  (token, refreshToken, profile, done) => {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(() => {
      // eslint-disable-next-line consistent-return
      User.findOne({ 'google.id': profile.id }, (err, user) => {
        if (err) {
          return done(err)
        }

        if (user) {
          return done(null, user)
        }

        const email = profile.emails[0].value

        AuthorizedDomains.findOne({}).then((doc) => {
          if (err) {
            return done(err)
          }
          let isAuthorizedEmail = false

          if (doc) {
            const domainList = doc.domainList
            for (let i = 0; i < domainList.length; i++) {
              const domain = domainList[i]
              if (email.includes(domain)) {
                isAuthorizedEmail = true
                break
              }
            }
          }

          if (isAuthorizedEmail) {
            const newUser = new User()

            // set all of the relevant information
            newUser.google.id = profile.id
            newUser.google.token = token
            newUser.google.name = profile.displayName
            newUser.google.email = email // pull the first email

            newUser.name = profile.displayName
            newUser.email = email

            // save the user
            newUser.save((error) => {
              if (error) {
                throw error
              }
              return done(null, newUser)
            })
          } else {
            return done('UNAUTHORIZED_DOMAIN')
          }

          return done(null, {})
        })
      })
    })
  }
)

passport.use(googleLogin)
