console.log('/app.js');


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
const db = require('./database.js');  


const cron = require('node-cron');
cron.schedule('0 0 */2 * * *',()=>{  // every 2 hour
  console.log('cron.schedule: ', moment().format('YYYY-DD-MM HH:mm:ss'));
  process.exit();
});

const formidable = require('formidable');
var utils = require('./utils');

// configure app
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

// middleware
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));  //for css etc.
app.use('/static', express.static('public/static'));  //serve static files
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser("keyboard cat"));
app.use('/public',express.static(path.join(__dirname,'public')));
app.use('/views',express.static(path.join(__dirname,'views')));
app.use('/upload', express.static(path.join(__dirname,'upload')));
app.use('/test', express.static(path.join(__dirname,'public/test')));


//share a folder with file list
var serveIndex = require('serve-index');
app.use('/share', serveIndex(path.join(__dirname, 'share')));
app.use('/share', express.static(path.join(__dirname, 'share')));

app.use(session({
  secret:'keyboard cat',
  cookie: {maxAge: 600000, nameInCookie:'nameInCookie'},
  resave: false,
  saveUninitialized: false,
}));
console.log('app.use(session)');

require('./middlewares').use(app);



// highlight new request
app.use(function(req,res,next){
  console.log("\n\n> " + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
  next();
});



app.use(
  /\/((?!login|register|home|test|m|p).)*/,    // exclude login and register + mobile
  function(req,res,next){
    next();
  },
  ensureLoggedIn
);


//log to db
app.use(
  /\/((?!log).)*/,
  require('./middlewares').logger
);

require('./routes')(app);
// var mRouter = require('./routes/m');
// app.use('/m', mRouter);

require('./app/')(app);    

app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 


process.on('unhandledRejection', (reason, promise) => {
  console.log('process.on(unhandledRejection) at: ',moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
  console.log('reason.stack:', reason.stack || reason)
});

app.use(require('./middlewares').errorHandler);



app.listen(app.get('port'),'0.0.0.0',function(){
  console.log('Express started on http://localhost:' +  app.get('port') + '; press Ctrl+C to terminate.');
  var log = new db.Log({user:'restart', method:'',url:'',date:Date.now()});
  log.save(()=>{
    console.log('restart log.save ok.');
  })
  

});
console.log(moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
console.log('===========app.js started===========');



