const R = require('./routes.js');

module.exports = exports = function(app){
    app.use('/m', R);
};