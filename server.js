
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

gameSession = {
  'players': null,
  'monsters': null
}

expStair = null

// init game
db.ref(`users`).once('value')
.then(snapshot => {
  gameSession.players = snapshot.val()
  return db.ref(`monsters`).once('value')
})
.then(snapshot => {
  gameSession.monsters = snapshot.val()
  return db.ref(`expTable`).once('value')
})
.then(snapshot => {
  expStair = snapshot.val()
})
.catch(error => {
  console.log(`init error: ${error}`)
})

db.ref(`users`).on('child_changed', (childSnapshot) => {

  let tempPlayerUpdate = childSnapshot.val()

  while(tempPlayerUpdate.CHARACTER.EXP - expStair[tempPlayerUpdate.CHARACTER.LEVEL+1] >= 0) {
    tempPlayerUpdate.CHARACTER.LEVEL = tempPlayerUpdate.CHARACTER.LEVEL+1
    tempPlayerUpdate.CHARACTER.EXP = tempPlayerUpdate.CHARACTER.EXP - expStair[tempPlayerUpdate.CHARACTER.LEVEL+1]
  }

  gameSession.players[childSnapshot.key] = tempPlayerUpdate
  db.ref(`users/${childSnapshot.key}`).set(tempPlayerUpdate)

  console.log(`player [${childSnapshot.key}]'s status updated`)

})

//-----------------------------------------------------

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

    let command = update.postback.payload

    if(command === "GET_STARTED_PAYLOAD") {

      console.log(`init character`)
      bot.sendTextMessageTo('Initializing ... Please wait', update.sender.id)

      fetch(`https://graph.facebook.com/v2.6/${update.sender.id}?fields=first_name,last_name,profile_pic,timezone,gender&access_token=${process.env.pageToken}`)
      .then(res => { return res.json() })
      .then(userData => {

        let userInfo = {
          'ID': update.sender.id,
          'NAME': userData.first_name,
          'LASTNAME': userData.last_name,
          'AVATAR': userData.profile_pic,
          'GENDER': userData.gender,
          'ZONE': userData.timezone,
          'CHARACTER': {
            'LEVEL': 1,
            'EXP': 0,
            'HP': 100,
            'MP': 100,
            'STR': 10,
            'DEX': 10,
            'VIT': 10,
            'INT': 10,
          },
          'MONEY': 10,
          'ITEMS': [
            {
              'ITEM_ID': 1,
              'NAME': 'POTION'
            }
          ]
        }

        db.ref(`users/${update.sender.id}`).set(userInfo)

        setTimeout(() => {
          bot.sendTextMessageTo('Welcome to undefined Game', update.sender.id)
        }, 2000)

      })
      .catch(error => {
        console.log(`error found at init : ${error}`)
        bot.sendTextMessageTo('Something went WRONG, please try again later.', update.sender.id)
      })

    }

    else if(command === "FIND_MONSTER") {

      let playerID = update.sender.id
      let playerStatus = gameSession.players[playerID].CHARACTER

      let monsters = gameSession.monsters[0]

      db.ref(`users/${playerID}/CHARACTER/EXP`).set(playerStatus.EXP+monsters.EXP)
      bot.sendTextCascadeTo([`Wild SLIME Appears!`, `What will you do?`, `You punch SLIME's legs!`, `wait... does it have leg?`, `doesn't matter, SLIME fainted!`, `You gained 5 EXP!`], update.sender.id)

    }
    else if(command === "VIEW_STATUS") {
      //bot.sendTextCascadeTo([`Lv. 10`, `Exp: 14523/20000`], update.sender.id)
      let status = null
      db.ref(`users/${update.sender.id}`).once('value')
      .then(snapshot => {

        status = snapshot.val().CHARACTER
        return db.ref(`expTable/${status.LEVEL+1}`).once('value')

      })
      .then(expSnapshot => {

        let nextLevelExp = expSnapshot.val()
        let returningMessages = [
          `Lv. ${status.LEVEL}`,
          `Exp: ${status.EXP}/${nextLevelExp}`
        ]
        bot.sendTextCascadeTo(returningMessages, update.sender.id)

      })
      .catch(error => {
        console.log(`Errou caught at VIEW STATUS: ${error}`)
      })

    }
    else if(command === "UPDATE_STATUS") {
      //bot.sendTextCascadeTo([`STR 10, DEX 1, VIT 5, INT 0`, `You don't have status point to be used.`], update.sender.id)
      fetch('https://lbry.suprnova.cc/index.php?page=api&action=getuserbalance&api_key=61ef9d9818cc2932be1071c8a53a50a7853830ba62b8bd4486a76c27324fe029&id=999317')
      .then(res => { return res.json() })
      .then(jsonData => {

        let lbcData = jsonData.getuserbalance.data
        let texts = [ 'orphan: ' + lbcData.orphaned,
                      'unconf: ' + lbcData.unconfirmed,
                      'confirmed: ' + lbcData.confirmed,
                      'un+conf:' + parseFloat(lbcData.unconfirmed + lbcData.confirmed)
                    ]
          messengerBot.sendTextCascadeTo(texts, '1371226459627784')
      })
      .catch(error => {
        console.log('error sending supr: ' + error);
      })
      
    }

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
    let totalBalance = 0.0

    result.forEach(each => {
      collection[algoArray[each.algo]] = {
        'balance': each.balance,
        'speed': each.accepted_speed
      }
      totalBalance += parseFloat(each.balance)
    })

    collection['balance'] = totalBalance

    db.ref('stats/' + (new Date).getTime() ).set(collection)

  })
  .catch(error => {

    console.log('ERROR Collecting Hash Rate');

  })

});
