
var db = require('./database');
var utils = require('./utils');
//middleware passport
var passport = require('passport');
var LocalStrategy = require('passport-local');
// var RememberMeStrategy = require('passport-remember-me').Strategy;

var strategy = new LocalStrategy(function verify(
  username, password, cb){
    // console.log('middleware.js new LocalStrategy...');
    db.User.findOne({username:username},function(error,user){
      if(error){console.log('error in finding one username'); return cb(error);}
      if(!user){console.log('find no user'); return cb(null, false, { message: 'Incorrect username or password.' });}
      // console.log('find one user:', user);
      // console.log('user.id:', user.id);
      if (user.password === password) {
        // console.log('user valid.');
        return cb(null, user);
      }else{
        // console.log('user valid, password wrong');
        return cb(error);
      }
    })
  });
passport.use('local',strategy);
passport.serializeUser(function(user, cb){
  // console.log('middleware.js passport serializeUser...');
  // console.log('middleware.js passport serializeUser... user:',user);
  process.nextTick(function(){
    // cb(null, { id: user.id, username: user.username });
    // console.log('middleware.js passport serializeUser... user.id:', user.id);
    cb(null, user.id);
  });
  // console.log('middleware.js passport serializeUser...ends');
});

passport.deserializeUser(function(_id,cb){
  // console.log('middleware.js passport deserializeUser...');
  process.nextTick(function(){
    db.User.findById(_id,(err,user)=>{
      // console.log('middleware.js passport deserializeUser..._id:',_id);
      if(err){
        cb(null, false, {error:err});
      } else{
        // console.log('middleware.js passport deserializeUser... user:', user);
        cb(null, user)
      }
    });
  });
  // console.log('middleware.js passport deserializeUser...ends');
});



// var rememberMeStrategy = new RememberMeStrategy(
//   //verify callback (consumes the token)
//   function(token,done){
//     console.log('middleware.js new RememberMeStrategy verify...');
//     console.log('Token:', Token);
//     Token.consume(token, function(err,user){
//       console.log('consuming token...');
//       if(err) { return done(err);}
//       if(!user) {return done(null, false);}
//       return done(null,user);
//     });
//   },
//   //issue callback (issues a new token)
//   function(user, done){
//     console.log('middleware.js new RememberMeStrategy issue...');
//     var token = utils.randomString(64);
//     console.log('new token generated: ', token);
//     Token.save(token,user.id,function(err){
//       console.log('saving new generated token...');
//       if(err) {return done(err);}
//       return done(null,token);
//     })
//   }
// )
console.log('middleware.js passport.use(rememberMeStrategy)...');
// passport.use(rememberMeStrategy);
console.log('middleware.js passport.use(rememberMeStrategy)...ends');










// middleware upload
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uniqueSuffix = new Date().toISOString().slice(0,19)
      .replace(/:/g,'-');
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const upload = multer({storage:storage});
console.log('exported middleware multer upload');



module.exports = {
  passport:passport,
  upload: upload
};

console.log('middlewares.js');
