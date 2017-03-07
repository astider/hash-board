//'use strict';

/*
 * nodejs-express-mongoose
 * Copyright(c) 2015 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

require('dotenv').config();
const Botmaster = require('botmaster')
/*
const fs = require('fs');
const join = require('path').join;
*/
const express = require('express');
//const mongoose = require('mongoose');
//const passport = require('passport');
//const config = require('./config');
//const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3002;
const app = express();

//require('./config/express')(app/*, passport*/);
//require('./config/routes')(app/*, passport*/);
/*
connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);
*/
app.listen(port, () =>{
  console.log('Express app started on port ' + port);
});
/*
function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  var connection = mongoose.connect(config.db, options).connection;
  return connection;
}
*/


const messengerSettings = {
  credentials: {
    verifyToken: "MarkDoYouReadThis",
    pageToken: "EAAZAzVapohu8BABkNfMT7JU5nscRTr5OmlSrr83QxCUgpTJ0TbqpZBjXOLsg4G6BhsgLt5tcdGgkBZBHC3z8lNZC1Sdy8PBKbk8cr8vTJZAVXJBLQ4cvaeEoalzZAXbAD2wyZBpsEGEOdzzyTsrKhjGXKC4GMwpvNoYeRjapQgucgZDZD",
    fbAppSecret: "d11dafa5ca2e91288af711bea4b98cbf",
  },
  webhookEndpoint: '/webhook92ywrnc7f9Rqm4qoiuthecvasdf42FG',
  // botmaster will mount this webhook on https://Your_Domain_Name/messenger/webhook1234
};

const botsSettings = [{
    messenger: messengerSettings
}];

const botmasterSettings = {
    botsSettings,
    app
};

const botmaster = new Botmaster(botmasterSettings);

const messengerBot = new Botmaster.botTypes.MessengerBot(messengerSettings);
botmaster.addBot(messengerBot)

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Hello world!');
});

console.log('ssss');
