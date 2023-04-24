console.log('/routes/index.js');

const pRouter = require('./patrol');

module.exports = exports = function(app){
  require('./auth')(app);
  require('./user')(app);
  require('./admin')(app);
  require('./test')(app);
  require('./patrol')(app);
};

