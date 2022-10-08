
var db = require('./database');
//middleware passport
var passport = require('passport');
var LocalStrategy = require('passport-local');
// var RememberMeStrategy = require('passport-remember-me').Strategy;

var strategy = new LocalStrategy(function verify(
  username, password, cb){
    db.User.findOne({username:username},function(error,user){
      if(error){console.log('error in finding one username'); return cb(error);}
      if(!user){console.log('find no user'); return cb(null, false, { message: 'Incorrect username or password.' });}
      console.log('find one user:', user);
      console.log('user.id:', user.id);
      if (user.password === password) {
        console.log('user valid.');
        return cb(null, user);
      }else{
        console.log('user valid, password wrong');
        return cb(error);
      }
    })
  });
passport.use('local',strategy);
passport.serializeUser(function(user, cb){
  console.log('serializeUser...');
  process.nextTick(function(){
    // cb(null, { id: user.id, username: user.username });
    cb(null, user.id);
  })
});

passport.deserializeUser(function(_id,cb){
  console.log('deserializeUser...');
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

// var rememberMeStrategy = new RememberMeStrategy(
//   function(token,done){
//     Token.consume(token, function(err,user){
//       if(err) { return done(err);}
//       if(!user) {return done(null, false);}
//       return done(null,user);
//     });
//   },
//   function(user, done){
//     var token = utils.generateToken(64);
//     Token.save(token,{userId: user.id},function(err){
//       if(err) {return done(err);}
//       return done(null,token);
//     })
//   }
// )
// passport.use(rememberMeStrategy);
// console.log('exported middleware passport with local and remember-me.');


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
