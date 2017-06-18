//let express = require('express')
let ejs = require('ejs');
//let express =

let bodyParser = require("body-parser");
let urlencodedParser = bodyParser.urlencoded({
 extended: true
});
let jsonParser = bodyParser.json();

/*
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:3000, https://dsmbot.herokuapp.com, https://messengerchatbot-f6775.firebaseapp.com");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type');

    next();
}
*/

module.exports = function(app, express) {

  app.set('views', './app/views');
  app.set('view engine', 'ejs');

  // let allowedHeader = ["http://localhost:3000", "https://dsmbot.herokuapp.com", "https://messengerchatbot-f6775.firebaseapp.com"]
  // app.use(function(req, res, next) {
  //
  //   var origin = req.get('origin');
  //   //console.log(req.session);
  //   if (origin) {
  //     console.log(`origin: ${origin}, ....... ${JSON.stringify(origin)}`);
  //    if (allowedHeader.indexOf(origin) > -1){
  //     res.header("Access-Control-Allow-Origin", "*")
  //    }
  //    else{
  //    return res.status(403).end();
  //    }
  //   }
  //
  //   res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
  //   res.header("Access-Control-Allow-Headers", "Origin, Content-Type");
  //
  //   console.log(`req.method = ${req.method}`);
  //   if ('OPTIONS' == req.method) {
  //    return res.status(200).end();
  //   }
  //
  //   next();
  //
  // })

  //app.use(allowCrossDomain)
  app.use(express.static('public'))



  app.get("/", function(req, res) {
    res.json({ 'text': 'yay' })
  })

  app.get("/*", (req, res) => { res.render("404") } )

}
