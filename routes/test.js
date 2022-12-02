


console.log('test.js.');

var multer = require('multer');
var path = require('path');
var utils = require('../utils');
var formidable = require('formidable');
var db = require('../database.js');

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

const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  // allowEmptyFiles:false,
  // minFileSize:2000,
  filename: function (name, ext, part, form){   //control newFilename
    console.log('name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});

const myusername = 'user1';
const mypassword = 'mypassword';
var session;

module.exports = function(app) {
  // app.get(['/test/','/test'], function(req,res){
  //   console.log('enter get /test/');
  //   res.render('test/test_menu.ejs');
  // });
  app.get('/test/error', function(req,res,next){
    console.log('enter GET /test/error...');
    throw new Error("Tentatively throw an error for testing...");
    res.send('/test/error threw an error: Tentatively throw an error for testing... ');
  });



  app.get('/test/error/async', async function(req,res,next){
    console.log('enter GET /test/error/async...');
    // try {
      throw new Error('Tentatively throw and async error for testing...');
    // } catch (error) {
    //   next(error);
    // }
  });

  app.get('/test/index', function(req,res,next){
    console.log('enter GET /test/index');
    res.render('test/test_menu.ejs')
  });

  app.get('/test/test', function(req,res,next){
    console.log('enter GET /test/test');
    res.render('test/test.ejs')
  });

  app.get('/test/image', function(req,res,next){
    console.log('enter GET /test/image');
    res.render('./test/test_image.ejs');
  });

  app.get('/test/test_image2',function(req,res,next){
    console.log('enter GET /test/test_image2');
    res.render('./test/test_image2.ejs');
  });

  app.post('/test/test_image2',function(req,res,next){
    console.log('enter POST /test/test_image2');
    var files = req.body.files;
    console.log('files:', files);
    res.send('/test/test_image2');
  });

  app.get('/test/test_upload', function(req,res,next){
    console.log('enter GET /test/test_upload');


    res.render('./test/test_upload.ejs');
  });

  app.post('/test/test_upload', function(req,res,next){
    console.log('enter POST /test/test_upload');
    console.log('outside form parse, req.files:',req.files);
    form.parse(req, (err,fields,files)=>{
      console.log('fields:', fields);
      console.log('files: ', files);
      res.send('response from server.');

      next();
    });
    // form.parse(req, (err,fields,files)=>{
    //   console.log('start parsing form data...');
    //   if (err) {
    //     console.log('err in parsing form: ', err);
    //     next(err);
    //     return;
    //   }
    //
    //   console.log('inside form parse, fields:', fields);
    //   console.log('inside form parse, files:',files);
    //   console.log('inside form parse, files.file.originalFilename:', files.file.originalFilename);
    //   console.log('inside form parse, files.file.newFilename:', files.file.newFilename);
    //
    // });

    // console.log('req:', req);
    // console.log('outside form parse, req.body:',req.body);
    // console.log('outside form parse, req.files:',req.files);
    // console.log('outside form parse, req :',req );

    // res.send(req.file);



  });

  app.get('/test/user_select_options',function(req,res,next){
    console.log('enter GET /test/user_select_options...');
    db.User.find({},{_id:0,username:1},function(err,usernames){
      console.log('usernames:', usernames);
      var options;
      usernames.forEach(function(username){
        console.log('username:',username);
        options += `<option value="${username['username']}">${username['username']}</option>`;
      });
      res.send(options);
    });
  });

  // app.get('/test/docx',function(req,res,next){
  //   console.log('enter GET /test/docx...');
  //   var id = 
  // });







































};  //module exports
