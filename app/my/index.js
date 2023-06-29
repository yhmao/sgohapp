const R = require('./routes');

module.exports = function(app){
    app.use('/my',R)
};