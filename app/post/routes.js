console.log('app/post/routes/post.js');

const db = require('../../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../utils');
const cookieParser = require('cookie-parser');
const router = require('express')();

const c = require('./controllers');

router.use(require('express').json());
router.use(require('express').urlencoded({ extended: false }));
router.use(cookieParser());
router.use(require('express').static(path.join(__dirname, 'public')));

router.locals.MOUNT = require('./mount.js');
console.log('router.locals.MOUNT: ',router.locals.MOUNT );
router.locals.moment = moment;

// router.use('/tinymce', require('express').static(path.join(__dirname, 'node_modules', 'tinymce')));





const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){   
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});

router.set('views', path.join(__dirname,'./views'));
router.set('view engine', 'pug');
router.use('/public',require('express').static(path.join(__dirname,'../public')));

router.use(c.debugUse);

router.get('/', function(req,res,next){
  router.locals.user = req.user;
  next();
})


router.get ('/',c.home);
router.get ('/home',c.home);
router.get ('/create', c.createGet);
router.post('/create', c.createPost);
router.get ('/show/:id',c.showId);                          // 记录显示
router.get ('/edit/:id',c.editId); 
router.post('/edit/:id',c.editIdPost);
router.get ('/edit/:id/remove',c.editIdRemove);                         // 记录编辑
router.post('/edit/:id/upload',c.editIdUpload);                        // 记录编辑
router.post('/edit/tiny/upload',c.editTinyUpload);

router.post('/edit/:id/comments/upload',c.editIdCommentsUpload);
router.post('/edit/:id/comments/:index/caption', c.editIdCommentsIndexCaption);
router.post('/edit/:id/comments/:index/text', c.editIdCommentsIndexText);
router.get ('/edit/:id/comments/:index/remove', c.editIdCommentsIndexRemove);

router.get ('/edit/file/:filename/remove',c.editFileRemove);

router.post('/list',c.list);                     // 列表搜索首次结果
router.get ('/list/:page',c.page);               // 列表搜索分页结果（根据cookies)




module.exports = exports = router;