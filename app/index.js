const postRouter = require('./post/routes');
const patrolRouter = require('./patrol/routes')

module.exports = exports = function(app){
    postRouter(app);
    patrolRouter(app);
};