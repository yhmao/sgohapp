// TP docspec

const R = require('./routes');
const M = require('./mount')
module.exports = function(app){
    app.use(M,R)
}