const path = require('path');


const router = require('express')();
const c = require('./controllers.js');


router.set('views', path.join(__dirname,'./views'));
router.set('view engine', 'pug');

router.get('/', c.home);
router.post('/list', c.list);
router.get('/list/:page',c.page);
router.get('/id/:id',c.findOneById);

router.get('/agg/wt/venue', c.wtCostSummaryByVenue);
router.get('/agg/wt/profession',c.wtCostSummaryByProfession);
router.get('/agg/wt/pv',c.wtCostSummaryByVenueAndProfession);
router.get('/listFiles',c.listFiles);


module.exports = router;