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

    if(update.message.text == 'stat sia' | update.message.text == 'stat eth') {

      let currency = (update.message.text.split(" "))[1]
      let address = "0x8d6295502a716bfed47b0add8afde3f8784934cc" //default for eth

      if(currency == 'sia')
        address = "9eb4092a101eef91e6de12b0ac86e1ae6fba635df2354234df4d14dc9596c4b33ba706bc0fce"

      fetch('https://api.nanopool.org/v1/' + currency + '/user/' + address)
      .then((res) => { return res.json() })
      .then((jsonData) => {

        let data = jsonData.data

        let avgHashrate = Object.keys(data.avgHashrate).reduce((sum, key)=> {
          return sum + parseFloat(data.avgHashrate[key])
        }, 0 ) + data.hashrate

        avgHashrate = parseFloat(avgHashrate)/6.0

        let textOrder = [
          'current hash rate: ' + data.hashrate,
          'avg hash rate: ' + avgHashrate,
          'current balance: ' + data.balance
        ]

        bot.sendTextCascadeTo(textOrder, update.sender.id)
/*
        bot.sendTextMessageTo('current hash rate: ' + data.hashrate, update.sender.id)
        bot.sendTextMessageTo('avg hash rate: ' + avgHashrate, update.sender.id)
        bot.sendTextMessageTo('current balance: ' + data.balance, update.sender.id)
*/
        return fetch('https://api.nanopool.org/v1/' + currency + '/approximated_earnings/' + avgHashrate)
      })
      .then((res) => { return res.json() })
      .then((jsonData) => {

        let rate = jsonData.data

        let day = rate.day
        let week = rate.week
        let month = rate.month

        let textOrder = [
          '1-day rate: ' + rounder(day.coins) + ' ' + currency.toUpperCase() + ', ' + rounder(day.bitcoins) + ' BTC, $' + rounder(day.dollars),
          '1-week rate: ' + rounder(week.coins) + ' ' + currency.toUpperCase() + ', ' + rounder(week.bitcoins) + ' BTC, $' + rounder(week.dollars),
          '1-month rate: ' + rounder(month.coins) + ' ' + currency.toUpperCase() + ', ' + rounder(month.bitcoins) + ' BTC, $' + rounder(month.dollars)
        ]

        bot.sendTextCascadeTo(textOrder, update.sender.id)
/*
        bot.sendTextMessageTo('1-day rate: ' + rounder(day.coins)
          + ' ETH, ' + rounder(day.bitcoins)
          + ' BTC, $' + rounder(day.dollars)
          , update.sender.id)

        bot.sendTextMessageTo('1-week rate: ' + rounder(week.coins)
          + ' ETH, ' + rounder(week.bitcoins)
          + ' BTC, $' + rounder(week.dollars)
          , update.sender.id)

        bot.sendTextMessageTo('1-month rate: ' + rounder(month.coins)
          + ' ETH, ' + rounder(month.bitcoins)
          + ' BTC, $' + rounder(month.dollars)
          , update.sender.id)
*/
      })
      .catch((error)=>{
        console.log('eth stat request error: ' + error);
      })

    }

    if(update.message.quick_reply) {


    }

  }
  else if(update.postback){


  }

});

function rounder(floatNumber) {
  return parseInt(floatNumber*10000)/10000
}


let nodeSchedule = require('node-schedule');
let rerunner = nodeSchedule.scheduleJob('*/10 * * * *', function(){
  console.log('running');
});
