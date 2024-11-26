console.log('app/home/routes.js');

const db = require('../../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../utils');
const router = require('express')();
// const c = require('./controlls.js');

router.set('views', path.join(__dirname,'./views'));
router.set('view engine', 'pug');
router.set('view engine', 'ejs');
// router.locals.MOUNT = require('./mount.js');
router.locals.moment = moment;


router.get('/',function(req,res,next){
    if (req.user) {
        res.redirect('/patrol');        
    } else {
        res.redirect('/home')
    }

});

router.get('/home',function(req,res,next){
    res.render('home.pug',{user:req.user});
});

module.exports = router;

