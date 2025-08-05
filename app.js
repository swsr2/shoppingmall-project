const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const indexRouter = require('./routes/index')
const app = express()

require('dotenv').config()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()) // req.body 객체로 인식

// 모든 요청에 대한 로깅 미들웨어 추가
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api', indexRouter)
const mongoURI = process.env.LOCAL_DB_ADDRESS;
mongoose.connect(mongoURI).then(() => console.log("mongoose connected")).catch((err) => console.log("DB Connection fail", err))

app.listen(process.env.PORT || 5000, () => {
    console.log("server on")
})