const routerPatrol = require('./patrol.js');
const routerMy = require('./my.js');
const routerM = require('./m.js');
const routerJ = require('./journal');

module.exports = exports = function(app) {
    app.use('/p', routerPatrol);
    app.use('/p/my',routerMy);
    app.use('/m', routerM);
    app.use('/j', routerJ);
};