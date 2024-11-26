console.log('uri.js');

const HOST_DB = require('./config.js').HOST_DB;
// ['MI_Local','MI_Ali','Ali_Ali']

const MI_Local =   "mongodb://localhost:27017/sgoh-node";
const MI_Ali   =   "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const Ali_Ali  =   "mongodb://admin:Flzx3000c@localhost:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";


var uri;  //mongodb connection string for sgoh-node
if(HOST_DB === 'MI_Local'){
  console.log("App running on MI, DB from MI");
  uri = MI_Local; 
}else if (HOST_DB === 'MI_Ali') {
  console.log("App running on MI, DB from Ali");
  uri = MI_Ali;
}else if (HOST_DB === 'Ali_Ali') {
  console.log("App running on Ali, DB from Ali");
  uri = Ali_Ali;
}

console.log('uri:',uri);

module.exports = exports = uri;