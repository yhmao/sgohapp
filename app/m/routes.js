console.log('app/m/routes/m.js');

const moment = require('moment');
const router = require('express')();
const c = require('./controlls.js');

router.use(function(req,res,next){
    res.locals.moment = moment;
    res.locals.user = req.user;
    next();
} );

router.get('/',function(req,res,next){
    res.send('m /');
})

router.get('/verify', c.verifyGet);
router.post('/verify', c.verifyPost);
router.get('/zones', c.zonesGet);
router.post('/record_patrol_new/:username', c.recordPatrolNew);
router.get ('/record_patrol/:id/:username', c.recordPatrolShowOne);

router.post('/record_patrol/:id/comment_add_text/:username', c.CommentAddText);
router.post('/record_patrol/:id/comment_add/:username', c.commentAdd);
router.get ('/record_patrol/:id/comment_remove/:cindex/:username', c.commentRemove);
router.get ('/record_patrol/:id/file_doc_remove/:fid/:username', c.fileDocRemove);
router.get ('/record_patrol/:id/remove/:username', c.recordRemove);
router.post('/record_patrol/:id/files/:fileIndex/comment/:username', c.filesComment);
router.post('/record_patrol/:id/children/:index/comment/:username', c.childrenComment);

router.post('/body_text/:username', c.bodyText);
router.post('/body_file_plus/:username', c.bodyFilePlus);
router.post('/main_FileText/:username', c.mainFileText);
router.post('/text_search/:page/:username', c.textSearch);
router.post('/record_patrol_list/search/:page/:username', c.searchPagination);
router.post('/record_patrol_list/search/co/:page/:username', c.searchCoPagination);  //兄弟单位
//批注
router.post('/record_patrol/:id/:type/:index/pz/add/:username', c.typePzAdd); // type: file/comment
router.get('/record_patrol/:id/file_doc/:fIndex/pz/:pzIndex/remove/:username', c.fileDocPzRemove);
router.get('/record_patrol/:id/comment/:cIndex/pz/:pzIndex/remove/:username', c.commentPzRemove)
router.get('/users_responsible', c.usersResponsible);

router.get('/my/projects/select/:username', c.myProjectsSelect);




module.exports = exports = router;