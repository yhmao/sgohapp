console.log('app/patrol/routes/patrol.js');

const moment = require('moment');
const path = require('path');
const router = require('express')();
router.set('views', path.join(__dirname,'../views'));
const s = require('./patrolService.js');


router.use(function(req,res,next){
    res.locals.moment = moment;
    res.locals.user = req.user;
    next();
} )


router.get('/home', s.home);
router.get('/', s.home);
router.get('/notice', s.notice);
router.get('/about', s.about);
router.get('/my', s.my);
router.get('/menu', s.menu);
router.post('/create',s.create);

router.get('/show/:id', s.show);
router.get('/listFull', s.listFull);
router.get('/list/:filter', s.listFilter);
router.get('/list/filter/:p', s.listFilterPagination);

router.get('/remove/:rid', s.remove);
router.get('/remove/:rid/:fid', s.removeFile);
router.get('/remove/:rid/:fid/:cid', s.removeFileReview);

router.post('/update', s.updateBodyText);
router.post('/add/:rid/file', s.addBodyFile);
router.post('/add/:rid/comment', s.addComment);
router.post('/add/:rid/:cid/review', s. addCommentReview);

router.get('/close/:rid', s.closeTrackComment);
router.post('/update/:rid/:fid/text', s.updateBodyFileText);

router.get('/search', s.searchGet);
router.post('/search', s.searchPost);

router.get('/list/:p', s.pagination);
router.get('/list/:p/rich', s.paginationRichText);




  
  
module.exports = exports = router;