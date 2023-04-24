const postRouter = require('./post.js');

module.exports = exports = function(app){
    app.use('/post', postRouter);
}