const express = require("express");
const app = express()
const {port} = require('./config')
const apiRouter = require('./routes/api')
const bodyParser = require('body-parser')
const cors = require('cors');
const { runDailyJob } = require("./dailyJob");
const cron = require('node-cron');

require("dotenv").config();
require('./db/mongoose')

app.use(bodyParser.json())
app.use(cors());
app.use('',apiRouter)

app.listen(port,function(){
  console.log("Serwer słucha http://localhost:" + port);
});


cron.schedule('24 17 * * *', ()=>runDailyJob());
