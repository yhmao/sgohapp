console.log('===========app.js Starting===========');

const util = require('util');
const fs = require('fs');
const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const db = require('./database.js');   //mongoose
const mw = require('./middlewares.js')  //more middlewares

var multer = require('multer');
var utils = require('./utils');

const storage = multer.diskStorage({
  destination: function(req,file,cb){
    console.log('storage destination.');
    cb(null, 'upload')
  },
  filename: function(req,file,cb){
    console.log("storage filename");
    cb(null, utils.yyyymmdd_hhmmss() + '_' + file.originalname);
  }
});
const upload = multer({storage:storage});

console.log("app.js require modules.");

// configure app
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

console.log('app.js app.set().');

// middleware
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));  //for css etc.
app.use('/static', express.static('public/static'));  //serve static files
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('dev'));
app.use(cookieParser("keyboard cat"));
app.use('/public',express.static(path.join(__dirname,'public')));
app.use('/views',express.static(path.join(__dirname,'views')));
app.use('/upload', express.static(path.join(__dirname,'upload')));
app.use('/test', express.static(path.join(__dirname,'public/test')));

//share a folder with file list
var serveIndex = require('serve-index');
app.use('/share', serveIndex(path.join(__dirname, 'public/static/share')));
app.use('/share', express.static(path.join(__dirname, 'public/static/share')));

app.use(session({
  secret:'keyboard cat',
  cookie: {maxAge: 600000, nameInCookie:'nameInCookie'},
  resave: false,
  saveUninitialized: false,
}));
// app.use(passport.authenticate('session'));

app.use(mw.passport.initialize());
app.use(mw.passport.session());
app.use(mw.passport.authenticate('session'));
// app.use(mw.passport.authenticate('remember-me'));

console.log('app.js app.use().');

//------------test start---------------------//
console.log('app.js xxxxxxxx');

app.use(function(req,res,next){
  console.log("------NEW REQUEST: " + req.method + "  " + req.originalUrl + "-------");

  next();
});

app.use(function(req,res,next){
  console.log('-----middleware for checking passport session ----');
  if (req.session.passport){console.log('req.session.passport:', req.session.passport);}
  if (req.user){console.log('req.user:',req.user);}
  console.log('-----middleware passport checking ends ----');
  next();
});

app.use(
  // /\/((?!login|register|).)*/,      // exclude login and register
  /\/((?!login|register|home|test).)*/,
  function(req,res,next){
  console.log('use ensureLoggedIn.');
  next();
  },
  ensureLoggedIn
);

require('./routes')(app);


//------------test end---------------------//


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded




app.get(['/t/:name/:age','/t'], function(req,res,next){


  var date = new Date();
  var yyyymmdd_hhmmss = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '_' + ("0" + date.getHours() ).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);


  // console.log('session: ', session);
  // console.log('session.secret: ', session.secret);
  // console.log('cookie', res.cookie);
  // req.session.cookie.expires = new Date(Date.now() + 3600000);


  //
  // console.log('req.seesionID: ', req.sessionID);
  // console.log('req.session.cookie:', req.session.cookie);
  // console.log('req.session.cookie.maxAge:', req.session.cookie.maxAge);
  // console.log('req.session.cookie.expires: ', req.session.cookie.expires);
  // console.log('req.session.cookie.originalMaxAge: ', req.session.cookie.originalMaxAge);
  // console.log('req.session: ', req.session);
  // console.log('req.session.secret: ', req.session.secret);



  // res.send('test id name');
  // res.write('<form action="/t" method="post"><input type="text" name="name" placeholder="name"/>');
  // res.write(' <input type="text" name="password" placeholder="password"/>');
  // res.write('<input type="submit" name="submit" value="Submit"/ > </form>');
  // res.end();
  console.log('session:', session);
  console.log('req.session:', req.session);
  console.log('req.session.id:', req.session.id);
  console.log('req.sessionID: ', req.sessionID);
  console.log('req.session.cookie:', req.session.cookie);
  console.log('req.cookie.maxAge:', req.session.cookie.maxAge);

  console.log('req.session.passport :', req.session.passport );
  // console.log('req.session.passport.user:', req.session.passport.user);
  // console.log('req.user:', req.user);
  res.send('test id name @'+ yyyymmdd_hhmmss);
});

app.post('/t', function(req,res,next){
  console.log('enter post /t');
  console.log('req.body:', req.body);
  console.log('req.params:', req.params);
  console.log('params:', req.body.name, req.body.password);
  console.log('Cookies:', req.cookies);
  console.log('Signed Cookies:', req.signedCookies);


  res.json(req.body);
})


// console.log('==========test end============');
//------------test---------------------//

app.listen(app.get('port'),'0.0.0.0',function(){
  console.log('Express started on http://localhost:' +
    app.get('port') + '; press Ctrl+C to terminate.');
});
console.log('===========app.js End===========');
