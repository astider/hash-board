const admin = require('firebase-admin')
const functions = require('firebase-functions')
const env = functions.config()

const cors = require('cors')({
  origin: ['http://localhost:5000']
})

admin.initializeApp(env.firebase)
const db = admin.firestore()

module.exports = {
  functions,
  admin,
  cors,
  env,
  db
}