module.exports = function(app){
  require('./auth')(app);
  require('./user')(app);
  require('./admin')(app);
  require('./test')(app);
};
console.log('index.js');
