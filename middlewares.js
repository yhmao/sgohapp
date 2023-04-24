console.log('/middlewares.js');

const db = require('./database');
const utils = require('./utils');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const moment = require('moment');

const strategy = new LocalStrategy(function verify(
  username, password, cb){
    // console.log('middleware.js new LocalStrategy...');
    db.User.findOne({username:username},function(error,user){
      if(error){console.log('db.User.findOne error:',error); return cb(error);}
      if(!user){console.log('db.User.findOne !user'); return cb(null, false, { message: 'Incorrect username or password.' });}
      if (user.password === password) {
        console.log('user.password === password');
        return cb(null, user);
      }else{
        return cb(error);
      }
    })
  });

passport.use('local',strategy);

passport.serializeUser(function(user, cb){
  process.nextTick(function(){
    cb(null, user.id);
  });
});

passport.deserializeUser(function(_id,cb){
  process.nextTick(function(){
    db.User.findById(_id,(err,user)=>{
      if(err){
        cb(null, false, {error:err});
      } else{
        cb(null, user)
      }
    });
  });
});

console.log('passport.use("local", strategy)');

module.exports.passport = exports.passport = passport;

module.exports.use = exports.use = function(app){
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate('session'));
};

let errorHandler = function(err, req, res, next) {
  console.log('errorHandler...');
  console.log('err:',err);
  console.log('err.stack:', err.stack);
  if (res.headersSent) {
    return next(err)
  }
  var errorLog = new db.ErrorLog({
    user: req.user,
    date: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
    url: req.originalUrl,
    error: err.toString(),
  });
  errorLog.save(()=>{
    console.log('errorLog.save ok.');
    res.status(500);
    res.send( `<p>errorHandler - Error: </p>${err} <p> ${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')} </p>
      <p>Request: ${req.originalUrl}</p><p>User: ${req.user}</p>` );
    console.log('res sent to client.');
  });
};

module.exports.errorHandler = exports.errorHandler = errorHandler;

let logger = function(req,res,next){
  // console.log('req:', req);
  if (req.user){
    var user = req.user.username;
    var url = req.originalUrl;
    var method = req.method;
    console.log('> log >', user, method, url);
    var log = new db.Log({user:user,method:method,url:url});
    log.save(()=>{
      // console.log('Saved log: ', log);
    });
  }
  next();
};
module.exports.logger = exports.logger = logger;
