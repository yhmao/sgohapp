console.log('/routes/auth.js');
var db = require('../database');
var passport = require('../middlewares').passport;
var formidable = require('formidable');

const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){   //control newFilename
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});


module.exports = function(app) {

// login 
app.get('/login',function(req,res){
  console.log('enter GET /login.');
  res.render('login');
});

// login
app.post('/login',
  function(req,res,next){
    console.log('enter POST /login');
    next();
    },
  passport.authenticate('local', {
    // successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
    }),
  function(req,res) {  // remember me
    if (req.body.remember_me === "yes"){
      console.log('req.body.remember_me === "yes"');
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;  //30days
    } else {
      console.log('!req.body.remember_me');
      req.session.cookie.expires = false; // Cookie expires at end of session
    }
    res.redirect('/');
    console.log('res sent to client: redirect /');
  }
);

// logout
app.get('/logout', function(req,res,next){
  console.log('enter GET /logout');
  req.logout(function(err){
    if (err) { 
      console.log('req.logout err:', err);
      return next(err);
    }
    res.redirect('/home');
    console.log('res sent to client (redirect /home )');
  })
});

// register
app.get('/register', function(req,res,next){
  console.log('enter GET /register');
  res.render('register');
  console.log('res sent to client.');
});

// register
app.post('/register', function(req,res,next) {
  console.log('enter POST /register');
  form.parse(req, (err,fields,files)=>{
    if (err) {
      console.log('form.parse err: ', err);
      next(err);
      return;
    }
    var username = fields.username;
    var nickname = fields.nickname;
    var cellphone = fields.cellphone;
    var password = fields.password;
    console.log('fields:', fields )
    if ( nickname == '') { nickname = username;}
    db.User.find({username:username},(err,users)=>{
      if (users.length>0) {
        console.log('db.User.find existing username.')
        res.send("你注册的用户名已存在，请重新输入用户名，或使用已有的用户名登录。");  
        console.log('res sent to client.');      
      } else {
        var user = new db.User({username, nickname,cellphone,password});
        user.save(function(err){
          if (err) {
            console.log('user.save err: ', err);
            return next(err);
          }
          console.log('user.save ok.');
          db.User.findOne({username:username},function(err,user){
            req.login(user, function(err){
              if (err) { 
                console.log('req.login err:', err);
                return next(err);
              }
              res.send(`你已成功注册，<br>用户名：${username}，<br>昵称：${nickname}，<br>手机号：${cellphone}，<br>密码：${password}。
              <br>已为你用刚注册的用户名登录。<br>请联系管理员设置你的权限以便你正常使用本系统。<br>
              <a href="/">点击这里进入首页</a>`);
              console.log('login ok. res sent to client');
            })
          });
        });
      }
    })
  });    
});

// my account
app.get('/my/account', function(req,res,next){
  console.log('enter GET /my/account');
  res.render('account_show',{user:req.user});
  console.log('res sent to client');
});

// my account edit: get form
app.get('/my/account/edit',function(req,res,next){
  console.log('enter GET my/account/edit');
  res.render('account_edit', {user:req.user});
  console.log('res sent to client.');
});

// my account edit: post form
app.post('/my/account/edit', function(req,res,next){
  console.log('enter POST my/account/edit');
  var nickname = req.body.nickname;
  var cellphone = req.body.cellphone;
  var password = req.body.password;
  console.log('nickname:', nickname);
  console.log('cellphone:', cellphone);
  console.log('password:', password);
  console.log('req.user.id:', req.user.id);
  db.User.findById(req.user.id, (err,user)=>{
    user.nickname = nickname;
    user.cellphone = cellphone;
    user.password = password;
    user.save(()=>{
      console.log('user.save ok, user:',user);
      res.redirect('/my/account');
      console.log('res sent to client redirect /my/account');
    });
  });
});






};  //module exports
