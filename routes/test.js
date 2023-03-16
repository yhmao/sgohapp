


console.log('/routes/test.js');

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

  app.get('/test/json', function(req,res,next){
    console.log('enter GET /test/json');
    var data = {'name':'mao', 'age':60};
    res.json(data);
  });

  app.get('/test/records/json', function(req,res,next){
    console.log('enter GET /test/records/json...');
    db.Record.find({},function(err,records){
      console.log('find records qty:', records.length);
      res.json(records);
    })
  });

  app.post('/m/upload',function(req,res,next){
    console.log('enter POST /m/upload');
    form.parse(req, (err,fields, files)=>{
      console.log('fields:', fields);
      console.log('files:', files);
      res.send('upload got.');
    })
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


  app.get('/test/search', function(req,res){
    console.log('GET /test/search...');
    res.send(`
      <form action="/test/search/10" method="POST">
        <input type="text" name="text" placeholder="please input query string..." />
        <input type="submit" value="Submit" />
      </form>    
    `)
  })
  app.post('/test/search/:p',function(req,res){
    console.log('POST /test/search...');
    var p = req.params.p;
    console.log('p:',p);
    var q = req.body.text;
    console.log('q:',q);

    var q1 = req.cookies.q;
    console.log("req.get q:", q1);


    res.cookie('q',q);
    res.send('response from /test/search');
  })








































};  //module exports
