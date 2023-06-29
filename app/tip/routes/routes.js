
const db = require('../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../../utils');
const router = require('express')();

const c = require('../controllers');



router.set('views', path.join(__dirname,'../views'));
router.set('view engine', 'pug');
router.use('/public',require('express').static(path.join(__dirname,'../public')));

router.get('/',function(req,res,next){
    res.send(`<h1>tip</h1>`);
});
router.get('/test', c.test);

router.get('/search', c.search);
router.post('/search', c.searchSubmit);
router.get('/create', c.create);
router.post('/create',c.createSubmit);

router.get('/:id', c.showOne);
router.post('/:id', c.editOne);

router.post('/upload/:filename', c.sendFile);

router.post('/:id/comments/text', c.addCommentText);
router.post('/:id/comments/file', c.addCommentFile);

router.get('/:id/comments/remove/:index', c.removeComment);

router.post('/:id/comments/index', c.editComment);








module.exports = exports = router;
