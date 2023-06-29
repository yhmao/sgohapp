console.log('/app.js');

// lib
const util = require('util');
const moment = require('moment');
const fs = require('fs');
const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const formidable = require('formidable');
// module
const db = require('./database.js');  
const utils = require('./utils');

// force restart
const cron = require('node-cron');
cron.schedule('0 0 */2 * * *',()=>{  // every 2 hour
  console.log('cron.schedule: ', moment().format('YYYY-DD-MM HH:mm:ss'));
  process.exit();
});


// configure app
var app = express();
app.set('port', process.env.PORT || 3000);

// engine
app.set('view engine', 'ejs');
app.set('view engine', 'pug');

// middleware
app.use(express.json());
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser("keyboard cat"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// public: css, js, html, icon
app.use('/public',express.static(path.join(__dirname,'public')));
// download
app.use('/upload',      express.static(path.join(__dirname, 'upload')));
app.use('/uploadShare', express.static(path.join(__dirname, 'uploadShare')));
app.use('/uploadTip',   express.static(path.join(__dirname, 'uploadTip')));

// session
app.use(session({
  secret:'keyboard cat',
  cookie: {maxAge: 600000, nameInCookie:'nameInCookie'},
  resave: false,
  saveUninitialized: false,
}));

// passport, errorHandler, logger
require('./middlewares').use(app);

// prompt
app.use(function(req,res,next){
  console.log("\n\n> " + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '  ' + req.method + ": " + req.url);
  next();
});

// exclude login
app.use(
  /\/((?!login|register|home|test|m|p|t|s|patrol).)*/,    // exclude login and register + mobile
  ensureLoggedIn
);

//logger db
app.use(
  /\/((?!log).)*/,
  require('./middlewares').logger
);

// routes
require('./app/')(app);    

// unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log('process.on(unhandledRejection) at: ',moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
  console.log('reason.stack:', reason.stack || reason)
});

// errorHandler
app.use(require('./middlewares').errorHandler);



app.listen(app.get('port'),'0.0.0.0',function(){
  console.log('Express started on http://localhost:' +  app.get('port') + '; press Ctrl+C to terminate.');
  var log = new db.Log({user:'restart', method:'',url:'',date:Date.now()});
  log.save(()=>{console.log('restart log.save ok.'); }); 
});

console.log(moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
console.log('===========app.js started===========');