var db = require('../database');
var passport = require('../middlewares').passport;
console.log('auth.js.');

module.exports = function(app) {

  app.get('/login',function(req,res){
    console.log('enter get login.');
    res.render('login');
  });

  app.post('/login',
    function(req,res,next){
      console.log('enter post login');
      next();
      },
    passport.authenticate('local', {
      // successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
      }),
    function(req,res) {  // remember me
      if (req.body.remember_me === "yes"){
        console.log('remember_me checked.');
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;  //30days
      } else {
        console.log('remember_me not checked.');
        req.session.cookie.expires = false; // Cookie expires at end of session
      }
      res.redirect('/');
    }
    // function(req,res,next){
    //   console.log('auth.js app POST login finish passport authenticate local');
    //   next();
    // },
    // function(req,res,next) {
    //   console.log('login middleware function for set remember_me cookie');
    //   if (!req.body.remember_me) { return next();}
    //   var token = utils.randomString(64);
    //   Token.save(token, {userId: req.user.id}, function(err){
    //     if (err) { return done(err);}
    //     res.cookie('remeber_me', token, {path: '/', httpOnly: true, maxAge: 604800000}); // 7 days
    //     return next();
    //   });
    // },
    // function(req,res) {
    //   res.redirect('/');
    // }
  );

  app.get('/logout', function(req,res,next){
    req.logout(function(err){
      if (err) { return next(err);}
      res.redirect('/home');
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
    var nickname = req.body.nickname;
    var cellphone = req.body.cellphone;
    var password = req.body.password;
    if (nickname == ''){nickname = username;}
    var user = new db.User({username, nickname,cellphone,password});
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

  app.get('/my/account', function(req,res,next){
    console.log('enter GET my account show');
    res.render('account_show',{user:req.user});
  });
  app.get('/my/account/edit',function(req,res,next){
    console.log('enter GET my account edit');
    res.render('account_edit', {user:req.user});
  });
  app.post('/my/account/edit', function(req,res,next){
    console.log('enter POST my account edit');
    // var username = req.body.username;
    var nickname = req.body.nickname;
    var cellphone = req.body.cellphone;
    var password = req.body.password;
    console.log('New nickname, cellphone, password: ', nickname,cellphone,password);
    console.log('user.id:', req.user.id);
    db.User.findById(req.user.id, (err,user)=>{
      console.log('user found from db: ', user);
      // user.username = username;
      user.nickname = nickname;
      user.cellphone = cellphone;
      user.password = password;
      user.save(()=>{
        console.log('user account modification saved to db.');
        console.log('user:', user);
        res.render('home',{user:user.username});
      });
    });
  });






};  //module exports
