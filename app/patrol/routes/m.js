console.log('app/patrol/routes/m.js');

const moment = require('moment');
const router = require('express')();
const s = require('./mService.js');

router.use(function(req,res,next){
    res.locals.moment = moment;
    res.locals.user = req.user;
    next();
} );

router.get('/verify', s.verifyGet);
router.post('/verify', s.verifyPost);
router.get('/zones', s.zones);
router.post('/record_patrol_new/:username', s.create);
router.get('/record_patrol/:id/:username', s.show);
router.post('/record_patrol/:id/comment_add_text/:username', s.addCommentTextOnly);
router.post('/record_patrol/:id/comment_add/:username', s.addComment);
router.get('/record_patrol/:id/comment_remove/:cindex/:username', s.removeComment);
router.get('/record_patrol/:id/file_doc_remove/:fid/:username', s.removeFileDoc);
router.get('/record_patrol/:id/remove/:username', s.removeRecord);
router.post('/record_patrol/:id/files/:fileIndex/comment/:username', s.addFileComment);
router.post('/record_patrol/:id/children/:commentIndex/comment/:username', s.addCommentComment);
router.post('/body_text/:username', s.updateBodyText);
router.post('/body_file_plus/:username', s.addRecordFile);
router.post('/main_FileText/:username', s.updateBodyFileText);
router.post('/text_search/:page/:username', s.searchText);
router.post('/record_patrol_list/search/:page/:username', s.pagination);
router.post('/record_patrol_list/search/co/:page/:username', s.paginationCo);  //兄弟单位
//批注
router.post('/record_patrol/:id/:type/:index/pz/add/:username', s.addPz); // type: file/comment
router.get('/record_patrol/:id/file_doc/:fIndex/pz/:pzIndex/remove/:username', s.removeFileDocPz);
router.get('/record_patrol/:id/comment/:cIndex/pz/:pzIndex/remove/:username', s.removeCommentPz)
router.get('/users_responsible',s.getResponsibleUsers);

module.exports = exports = router;