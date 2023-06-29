
module.exports = exports = function(app){
    require('./admin')(app);
    require('./auth')(app);
    require('./home')(app);
    require('./m')(app);
    require('./my')(app);
    require('./patrol')(app);
    // require('./post')(app);
    require('./share')(app);
    // require('./tip')(app);
};