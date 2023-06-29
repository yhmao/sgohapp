console.log('app/post/routes/post.js');

const db = require('../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../../utils');
const cookieParser = require('cookie-parser');
const router = require('express')();

const c = require('../controllers');

router.use(require('express').json());
router.use(require('express').urlencoded({ extended: false }));
router.use(cookieParser());
router.use(require('express').static(path.join(__dirname, 'public')));

router.use('/tinymce', require('express').static(path.join(__dirname, 'node_modules', 'tinymce')));





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
router.set('view engine', 'pug');
router.use('/public',require('express').static(path.join(__dirname,'../public')));

router.use(c.debugUse);

router.get('/test', c.test);
router.post('/test', c.testSubmit);
router.post('/upload',c.upload);
router.get('/remove/:filename',c.remove);

router.get('/',function(req,res,next){
  res.send('post /');
});

router.get('/home', function(req,res,next){
  console.log('post /home');
  res.render('home', {user: 'hello'});
})

router.get('/index', function(req,res,next){
  console.log('GET /index');
  res.render('index',{title:'Title'});
})



router
  .route('/post/new')
  .get( c.postForm)
  .post( c.newPost );



module.exports = exports = router;