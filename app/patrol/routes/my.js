console.log('app/patrol/routes/my.js');

const moment = require('moment');
const path = require('path');
const router = require('express')();
router.set('views', path.join(__dirname,'../views'));
let s = require('./myService.js');
router.use(function(req,res,next){
    res.locals.moment = moment;
    res.locals.user = req.user;
    next();
} )

router.post('/setCurrentProject', s.setCurrentProject);

module.exports = exports = router;