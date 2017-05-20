require('dotenv').config();
const Botmaster = require('botmaster')
const express = require('express');
const https = require('https');
const fetch = require('node-fetch')
const port = process.env.PORT || 3002;
//const app = express();

let app = express()
//module.exports = app;

require('./app/config/express.js')(app, express)

// let messengerProfileAPI = require('./app/apis/messenger_profile.api.js')
// let userMgt = require('./app/controllers/userManagement.controller.js')
// let firebase = require('./app/config/firebase.init.js')
// let database = firebase.database()
//let firebase = require('firebase')


app.listen(port, () => {
  console.log('Express app started on port ' + port);
});

const messengerSettings = {
  credentials: {
    verifyToken: process.env.vToken,
    pageToken: process.env.pageToken,
    fbAppSecret: process.env.appSecret,
  },
  webhookEndpoint: process.env.hookPlace,
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


// -------------------------------------------------------------------------

botmaster.on('update', (bot, update) => {

  if(update.message) {

    //bot.sendTextMessageTo('hello', update.sender.id)

    if(update.message.text == 'eth plz') {

      fetch('https://api.nanopool.org/v1/eth/user/0x8d6295502a716bfed47b0add8afde3f8784934cc')
      .then((res) => { return res.json() })
      .then((jsonData) => {
        let data = jsonData.data

        bot.sendTextMessageTo('current hash rate: ' + data.hashrate, update.sender.id)
        bot.sendTextMessageTo('current balance: ' + data.balance, update.sender.id)
        bot.sendTextMessageTo('not conf balance: ' + data.unconfirmed_balance, update.sender.id)

      })

    }

    if(update.message.quick_reply) {


    }

  }
  else if(update.postback){


  }

});


let nodeSchedule = require('node-schedule');
let rerunner = nodeSchedule.scheduleJob('*/10 * * * *', function(){
  console.log('running');
});
