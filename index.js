const express = require('express')
const cors = require('cors')
const userRoute = require('./routes/user')
const app = express()
const dotenv = require('dotenv')

dotenv.config()

app.use(cors())
app.use(express.json())
app.use('/',userRoute)

app.listen(3000,()=>{console.log('server is up on port 3000')
})
