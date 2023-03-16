console.log('/middlewares.js');

var db = require('./database');
var utils = require('./utils');
var passport = require('passport');
var LocalStrategy = require('passport-local');

var strategy = new LocalStrategy(function verify(
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

module.exports = {
  passport:passport,
};


