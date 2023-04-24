console.log('app/patrol/routes/journal/j.js');


const moment = require('moment');
const path = require('path');
const router = require('express')();
router.set('views', path.join(__dirname,'./views'));
const s = require('./control.js');


router.use(function(req,res,next){
    res.locals.moment = moment;
    res.locals.user = req.user;
    next();
} )


router.get('/', s.home);
router.get('/home', s.home);
router.get('/form', s.formDisplay);
router.post('/form', s.formSubmit);
router.get('/show/:_id', s.show);
router.post('/home',s.list);
router.get('/edit/:_id', s.edit);
router.get('/generateJForm/:_id', s.generateJForm);





module.exports = exports = router;