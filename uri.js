console.log('uri.js');

//check computer and select mongodb connection uri
console.log('process.platform:',process.platform);
const os = require('os');
console.log('hostname:', os.hostname());

const MI = "DESKTOP-F1V3PN0";

const localSgoh =      "mongodb://localhost:27017/sgoh-node";
const localSgoh3Y =    "mongodb://admin:Flzx3000c@localhost:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const remoteYYO2Sgoh = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

var uri;  //mongodb connection string for sgoh-node
if(os.hostname() == MI){
  console.log("running on windows MI.");
  uri = localSgoh; console.log('using MI localhost:27017/sgoh-node database');
  // uri = remoteYYO2Sgoh; console.log('using remote 8.134.79.194:27017:27017/sgoh-node database.');
}else if (os.hostname == "yyo2") {
  console.log("running on ali server yyo2 1y.");
  uri = remoteYYO2Sgoh;
}else {
  console.log("running on ali server 3y.");
  uri = localSgoh3Y;
}

module.exports = exports = uri;