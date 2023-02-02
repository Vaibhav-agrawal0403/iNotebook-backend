const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')

connectToMongo();
const app = express()

// Step 1 : Heroku
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

// step 3: Heroku
if (process.env.NODE_ENV == "production") {
  app.use(express.static("frontend/build"));
}

app.listen(port, () => {
  console.log(`iNotebook backend listening at http://localhost:${port}`)
})