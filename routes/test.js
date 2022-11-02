


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
  // app.get(['/test/','/test'], function(req,res){
  //   console.log('enter get /test/');
  //   res.render('test/test_menu.ejs');
  // });

  app.get('/test/index', function(req,res,next){
    console.log('enter GET /test/index');
    res.render('test/test_menu.ejs')
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




};  //module exports
