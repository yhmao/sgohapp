if (require('../config.js').TIPONLY) {
    module.exports = exports = function(app){
    // require('./admin')(app);
    // require('./auth')(app);
    // require('./home')(app);
    // require('./m')(app);
    // require('./my')(app);
    // require('./patrol')(app);
    // require('./post')(app);
    // require('./share')(app);
    require('./tip')(app);
};
} else {
    module.exports = exports = function(app){
    require('./m')(app);        
    require('./admin')(app);
    require('./auth')(app);
    require('./home')(app);
    require('./patrol')(app);
    require('./share')(app);    
    require('./post')(app);
    require('./my')(app);
    require('./item')(app);
    require('./spotCheck')(app);
};
}


