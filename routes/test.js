


console.log('test.js.');

var multer = require('multer');
var path = require('path');
var utils = require('../utils');
var formidable = require('formidable');

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

const myusername = 'user1';
const mypassword = 'mypassword';
var session;

module.exports = function(app) {
  app.get(['/test/','/test'], function(req,res){
    console.log('enter get /test/');
    res.send('test page: <br> home; session; ajax');
  });

  app.get('/test/bs', function(req,res,next){
    console.log('enter GET /test/bs');
    res.render('./test/test_bootstrap.ejs');
  });

  app.get('/test/home', function(req,res,next){
    console.log('enter /test/home');
    console.log('req.session: ', req.session);
    req.session.mybool = true;
    req.session.somedata = 'mystring';
    req.session.evenobjects = { data : 'somedata' };
    // res.send('Session set!');
    if (req.session.views){
      req.session.views++;
      res.setHeader('Content-Type', 'text/html');
      res.write('<p>views: ' + req.session.views + '</p>');
      res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
      res.write('Session set!');
      res.end();
    } else {
      req.session.views =1;
      res.send('Welcome to the session demo. refresh!');
    }
    console.log('req.sessionID:', req.sessionID);
    // req.session.regenerate(function(err){
    //   if(err){console.log('err in regenerate session');}
    //   console.log('req.sessionID after regenerate session: ', req.sessionID);
    // });

    console.log('app.get env: ', app.get('env'));


    console.log('connect.sid:', req.session.cookies);
  });

  app.get('/test/session', function(req,res,next){
    console.log('__dirname:', __dirname);
    session1 = req.session;
    if(session1.userid){
      res.send("Welcome User <a href=\'/logout'>click to logout</a>");
    }else{
      res.render('test/index.ejs')
    }
  });

  app.post('/test/session/user',(req,res) => {
    console.log('myusername:', myusername, 'mypassword:',mypassword);
    if(req.body.username == myusername && req.body.password == mypassword){
        session=req.session;
        session.userid=req.body.username;
        console.log(req.session)
        res.send(`Hey there, welcome <a href=\'/test/session/logout'>click to logout</a>`);
    }
    else{
        res.send('Invalid username or password');
    }
});

app.get('/test/session/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/test/session');
    console.log('session after destroy:', req.session);
});

app.get('/test/ajax', function(req,res,next){
  console.log('enter test ajax_info');
  res.render('test/test_ajax.ejs');
  // res.render('test/test_ajax.ejs');
});

app.post('/test/ajax',
  function(req,res,next){
    console.log('enter post test/ajax...');
    var myText = req.body.myText;
    var myPassword = req.body.myPassword;
    console.log('myText and myPassword:', myText, myPassword);
    res.json({myText:myText, myPassword:myPassword});
  }
);



// app.post('/test/ajax',
// upload.single('file'),
// function(req,res,next){
//   const form = formidable({multiples:true});
//
//   form.parse(req,(err,fields,files)=>{
//     if (err) {
//       console.log('err during form parse using formidable');
//       next(err);
//       return;
//     }
//     console.log('fields:',fields);
//     console.log('files:', files);
//     res.json({fields, files});
//   });
//
//
//   console.log('enter post ajax');
//   console.log('req.body:', req.body);
//   console.log('req.body.name:', req.body.name);
//   console.log('req.params:', req.params);
//   console.log('req.form:', req.form);
//   var file;
//   if (req.file) {console.log('req.file:', req.file);}else {
//     console.log('req.file === None');
//   };
  // res.send('<p>Response from post test/ajax:</p><p> data recieved from post test/ajax.</p>')
// });


// test jquery
app.get('/test/t', function(req,res,next){
  console.log('enter test/t');
  res.render('test/t.ejs');
});

app.get('/test/js', function(req,res,next){
  console.log('enter GET /test/js');
  res.render('test/js.ejs');
});





};  //module exports
