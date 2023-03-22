console.log('/database.js');

var mongoose = require('mongoose');

//check computer and select mongodb
console.log('process.platform:',process.platform);
const os = require('os');



console.log('hostname:', os.hostname());
var url;
if(os.hostname() == "DESKTOP-F1V3PN0"){
  console.log("running on windows MI.");
  // url = 'mongodb://localhost:27017/sgoh-node';
  // uncomment next line if using ali 3y mongodb:
  url = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
}else if (os.hostname == "yyo2") {
  console.log("running on ali server yyo2 1y.");
  url = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
}else {
  console.log("running on ali server 3y.");
  url = "mongodb://admin:Flzx3000c@localhost:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
  // url = 'mongodb://localhost:27017/sgoh-node';
}

var database = mongoose.connect(url);

const userSchema = new mongoose.Schema({
  username: String,
  nickname: String,
  cellphone: String,
  password: String,
  role: {type:String, default: 'user'},  //监理，负责，项目总负责，项目总监，事业部，集团 supervisor,teamLeader,siteManager,projectManager,divisionManager, companyManager,
  team: String, //钢结构，土建，安装，舞台
  date: {type: Date, default: Date.now},
  dateUpdate: {type:Date, default:Date.now},
  selectable: Number,
  projects: Array,
});
const User = mongoose.model('User', userSchema);

const recordSchema = new mongoose.Schema({
  user: {type:String,default:'user'},
  date: {type:Date, default:Date.now},
  dateUpdate: {type:Date, default:Date.now},  //update when any modification
  project: {type: String, default:'SGOH'},
  profession: String,
  zone: String,
  title: String,
  patrolType: String, //质量，日常
  text: String,     //for BodyFiles: = text
  file: String,
  files: Array, //allow multiple files. 批注：files.children.text
  caption: String,
  status: String,  //followup,closed
  responsible: String,  //person assigned by siteManager
  annotation: String,   // record: 巡视情况：正常，关注，有问题，有疑问
  keywords: String,  //for later organize
  exposure: {type: String, default:'public'},  // visible to: private,siteManager,projectManager...
  parents: Array,  // array of id
  children: Array   // array of document
});
recordSchema.index({'$**':'text'});
const Record = mongoose.model('Record', recordSchema);
const Comment = mongoose.model('Comment', recordSchema);
const Review = mongoose.model('Review', recordSchema);
const Sharefile = mongoose.model('Sharefile', recordSchema);
const BodyFile = mongoose.model('BodyFile', recordSchema);

const zoneSchema = new mongoose.Schema({
  user: {type:String, default:''},
  userUpdate:{type:String, default:''},
  date: {type:Date, default:Date.now},
  dateUpdate: {type:Date, default:Date.now},
  zoneCode: String,
  zoneDescription: String,
});
const Zone = mongoose.model('Zone',zoneSchema);


const logSchema = new mongoose.Schema({
  user: String,
  date: {type: Date, default:Date.now},
  method: String,  // post, get
  url: String,
});
const Log = mongoose.model('Log', logSchema);

const errorLogSchema = new mongoose.Schema({
  user: String,
  date: String,
  url: String,
  error: String
});
const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);


module.exports = {
  database:database,
  User:User,
  Record:Record,
  Comment:Comment,
  Review: Review,
  BodyFile:BodyFile,
  Sharefile:Sharefile,
  Zone:Zone,
  Log:Log,
  ErrorLog:ErrorLog
};
