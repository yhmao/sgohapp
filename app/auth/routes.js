console.log('/app/auth/routes.js');
var db = require('../../database');
var passport = require('../../middlewares').passport;
var formidable = require('formidable');
const router = require('express')();
const path = require('path');
router.set('views', path.join(__dirname,'./views'));
router.set('view engine', 'pug');
router.set('view engine', 'ejs');

const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){   //control newFilename
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});

// router.get('/',function(req,res,next){
//   res.send('auth /');
// });


// login 
router.get('/login',function(req,res){
  console.log('enter GET /login.');
  res.render('login');
});

// login
router.post('/login',
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
    console.log('req.user:', req.user);
    res.cookie('user',req.user.username);
    res.redirect('/');
    console.log('res sent to client: redirect /');
  }
);

// logout
router.get('/logout', function(req,res,next){
  console.log('enter GET /logout');
  req.logout(function(err){
    if (err) { 
      console.log('req.logout err:', err);
      return next(err);
    }
    res.redirect('/');
    console.log('res sent to client (redirect / )');
  })
});

// register
router.get('/register', function(req,res,next){
  console.log('enter GET /register');
  res.render('register');
  console.log('res sent to client.');
});

// register
router.post('/register', function(req,res,next) {
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

module.exports = exports = router;


