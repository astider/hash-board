
const Botmaster = require('botmaster')
const express = require('express')
const https = require('https')
const fetch = require('node-fetch')
const port = process.env.PORT || 3002
const firebase = require('firebase')
//const app = express();

let app = express()
//module.exports = app;

require('./app/config/express.js')(app, express)

// let messengerProfileAPI = require('./app/apis/messenger_profile.api.js')
// let userMgt = require('./app/controllers/userManagement.controller.js')
// let firebase = require('./app/config/firebase.init.js')
// let database = firebase.database()
//let firebase = require('firebase')
let firebaseConfig = {
  apiKey: process.env.firebaseAPIKey,
  databaseURL: "https://hashbot-c4d51.firebaseio.com/"
}

firebase.initializeApp(firebaseConfig)
let db = firebase.database()


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

console.log('it works ?')
// -------------------------------------------------------------------------




botmaster.on('update', (bot, update) => {

  console.log('info : ' + JSON.stringify(update))

  if(update.message) {

    //bot.sendTextMessageTo('hello', update.sender.id)
    console.log('bot got message');

    db.ref('testValue').once('value')
    .then(snapshot => {
      bot.sendTextMessageTo(snapshot.val(), update.sender.id)
    })
    .catch(error => {
      console.log('error with DB: ' + error)
    })

    if(update.message.text.indexOf('view eth') > -1 ) {

      let url = 'https://eth.nanopool.org/account/0x8d6295502a716bfed47b0add8afde3f8784934cc'
      bot.sendTextMessageTo('Here: ' + url, update.sender.id)

    }
    else if(update.message.text.indexOf('view sia') > -1){

      let url = 'https://sia.nanopool.org/account/9eb4092a101eef91e6de12b0ac86e1ae6fba635df2354234df4d14dc9596c4b33ba706bc0fce'
      bot.sendTextMessageTo('Here: ' + url, update.sender.id)

    }
    else if(update.message.text.indexOf('stat sia') > -1 || update.message.text.indexOf('stat eth') > -1) {

      let currency = ''
      let address = ''

      if(update.message.text.indexOf('sia') > -1) {
        currency = 'sia'
        address = "9eb4092a101eef91e6de12b0ac86e1ae6fba635df2354234df4d14dc9596c4b33ba706bc0fce"
        console.log('currency and address setup for ' + currency);
      }
      else if(update.message.text.indexOf('eth') > -1) {
        currency = 'eth'
        address = "0x8d6295502a716bfed47b0add8afde3f8784934cc"
        console.log('currency and address setup for ' + currency);
      }

      fetch('https://api.nanopool.org/v1/' + currency + '/user/' + address)
      .then((res) => { return res.json() })
      .then((jsonData) => {

        let data = jsonData.data
        let avgHashrate = 0

        if(update.message.text.indexOf('classic') > -1)
            avgHashrate = parseFloat(data.avgHashrate.h6)

        else {

          avgHashrate = Object.keys(data.avgHashrate).reduce((sum, key)=> {
            return sum + parseFloat(data.avgHashrate[key])
          }, 0 ) + data.hashrate

          avgHashrate = parseFloat(avgHashrate)/6.0

        }

        let textOrder = [
          'current hash rate: ' + data.hashrate,
          'avg hash rate: ' + avgHashrate,
          'current balance: ' + data.balance
        ]

        if(currency == 'sia')
          textOrder.push('unconfirmed balance: ' + data.unconfirmed_balance)

        bot.sendTextCascadeTo(textOrder, update.sender.id)

        return fetch('https://api.nanopool.org/v1/' + currency + '/approximated_earnings/' + avgHashrate)

      })
      .then((res) => { return res.json() })
      .then((jsonData) => {

        let rate = jsonData.data

        let day = rate.day
        let week = rate.week
        let month = rate.month

        let textOrder = [
          '1-day rate: ' + rounder(day.coins, 2) + ' ' + currency.toUpperCase() + ', ' + rounder(day.bitcoins, 4) + ' BTC, $' + parseInt(day.dollars),
          '1-week rate: ' + rounder(week.coins, 2) + ' ' + currency.toUpperCase() + ', ' + rounder(week.bitcoins, 4) + ' BTC, $' + parseInt(week.dollars)//,
          //'1-month rate: ' + rounder(month.coins) + ' ' + currency.toUpperCase() + ', ' + rounder(month.bitcoins) + ' BTC, $' + rounder(month.dollars)
        ]

        setTimeout(()=>{
          bot.sendTextCascadeTo(textOrder, update.sender.id)
        }, 1000)

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

function rounder(floatNumber, point) {
  return parseInt( floatNumber * Math.pow(10, point) ) / Math.pow(10, point)
}



let nodeSchedule = require('node-schedule');
let rerunner = nodeSchedule.scheduleJob('*/20 * * * *', function(){

  fetch('https://api.nicehash.com/api?method=stats.provider&addr=17vY5jqyieHEr8SotznGekCPEixWsM9Ryp')
  .then(res => { return res.json() })
  .then(jsonData => {

    let result = jsonData.result.stats
    let algoArray = [
      'Scrypt',
      'SHA256',
      'ScryptNf',
      'X11',
      'X13',
      'Keccak',
      'X15',
      'Nist5',
      'NeoScrypt',
      'Lyra2RE',
      'WhirlpoolX',
      'Qubit',
      'Quark',
      'Axiom',
      'Lyra2REv2',
      'ScryptJaneNf16',
      'Blake256r8',
      'Blake256r14',
      'Blake256r8vnl',
      'Hodl',
      'DaggerHashimoto',
      'Decred',
      'CryptoNight',
      'Lbry',
      'Equihash',
      'Pascal',
      'X11Gost',
      'Sia'
    ]

    let collection = {}

    result.forEach(each => {
      collection[algoArray[each.algo]] = {
        'balance': each.balance,
        'speed': each.accepted_speed
      }
    })


    db.ref('stats/' + (new Date).getTime() ).set(collection)

  })
  .catch(error => {

    console.log('ERROR Collecting Hash Rate');

  })

});
