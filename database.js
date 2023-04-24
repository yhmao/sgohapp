console.log('/database.js');

const uri = require("./uri.js");

const Mongoose = require('mongoose').Mongoose;
const mongoose = new Mongoose();
mongoose.connect(uri)

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

const projectSchema = new mongoose.Schema({
  name: {type:String, default:''},
  code:{type:String, default:''},
  date: {type:Date, default:Date.now},
  dateUpdate: {type:Date, default:Date.now},
  members: Array,
});
const Project = mongoose.model('Project',projectSchema);


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
  mongoose:mongoose,
  User:User,
  Record:Record,
  Project:Project,
  Comment:Comment,
  Review: Review,
  BodyFile:BodyFile,
  Sharefile:Sharefile,
  Zone:Zone,
  Log:Log,
  ErrorLog:ErrorLog
};
