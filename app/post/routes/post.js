console.log('app/post/routes/post.js');

const db = require('../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../../utils');
const router = require('express')();



const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/\/..\/\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){   
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});

router.set('views', path.join(__dirname,'../views'));

router.get('/', function(req,res,next){
  console.log('post /');
  res.send('post /');
})

router.get('/home', function(req,res,next){
  console.log('post /home');
  res.render('home', {user: 'hello'});
})


module.exports = exports = router;