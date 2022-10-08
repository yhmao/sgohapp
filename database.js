var mongoose = require('mongoose');

//check computer and select mongodb
console.log('process.platform:',process.platform);
const os = require('os');
console.log('hostname:', os.hostname());
var url;
if(os.hostname() == "DESKTOP-F1V3PN0"){
  console.log("running on windows MI.");
  url = 'mongodb://localhost:27017/sgoh-node';
  // uncomment next line if using ali 3y mongodb:
  // url = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
}else if (os.hostname == "yyo2") {
  console.log("running on ali server yyo2 1y.");
  url = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
}else {
  console.log("running on ali server 3y.");
  url = 'mongodb://localhost:27017/sgoh-node';
}

var database = mongoose.connect(url);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {type:String, default: 'user'},
  created: {type: Date, default: Date.now}
});
const User = mongoose.model('User', userSchema);

const recordSchema = new mongoose.Schema({
  user: {type:String,default:'user'},
  date: {type:Date, default:Date.now},
  dateUpdate: {type:Date, default:Date.now},
  project: {type: String, default:'SGOH'},
  profession: String,
  region: String,
  text: String,
  file: {type:String, default: ''},
  caption: String,
  parents: [],
  children: []
});
const Record = mongoose.model('Record', recordSchema);
const Comment = mongoose.model('Comment', recordSchema);

const zoneSchema = new mongoose.Schema({
  user: {type:String, default:''},
  userUpdate:{type:String, default:''},
  date: {type:Date, default:Date.now},
  dateUpdate: {type:Date, default:Date.now},
  zoneCode: String,
  zoneDescription: String,
});
const Zone = mongoose.model('Zone',zoneSchema);



module.exports = {
  database:database,
  User:User,
  Record:Record,
  Comment:Comment,
  Zone:Zone
};
console.log('database.js.');
console.log('-----------');
