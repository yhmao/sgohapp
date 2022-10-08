var db = require('../database');
var passport = require('../middlewares').passport;
console.log('auth.js.');

module.exports = function(app) {

  app.get('/login',function(req,res){
    console.log('enter get login.');
    res.render('login');
  });

  app.post('/login', function(req,res,next){
    console.log('enter post login');
    next();
  }, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  app.get('/logout', function(req,res,next){
    req.logout(function(err){
      if (err) { return next(err);}
      res.send('You have logged out.')
    })
  });

  app.post('/logout', function(req,res,next){
    req.logout(function(err){
      if (err) { return next(err);}
      res.send('You have logged out.')
    })
  });

  app.get('/register', function(req,res,next){
    console.log('enter get register');
    res.render('register');
  });
  app.post('/register', function(req,res,next) {
    console.log('enter post register.');
    var username = req.body.username;
    var password = req.body.password;
    var user = new db.User({username, password});
    console.log('register user: ', user);
    user.save(function(err){
      if (err) {
        console.log('err saving register: ', err);
        return next(err);
      }
      console.log('saved one user.');
      db.User.findOne({username:username},function(err,user){
        req.login(user, function(err){
          if (err) { return next(err);}
          res.send('user register successful and now you are logged in with the registration.')
        })
      });
    });
  });

};  //module exports
