
module.exports.yyyymmdd_hhmmss = function(){
  var date = new Date();
  var yyyymmdd_hhmmss = date.getFullYear() + ("0" + (date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '_'
    + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
  console.log('yyyymmdd_hhmmss:', yyyymmdd_hhmmss);
  return yyyymmdd_hhmmss;
};
console.log('utils.js.');
