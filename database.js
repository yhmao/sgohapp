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
  debug:String,
});
const User = mongoose.model('User', userSchema);

const recordSchema = new mongoose.Schema({
  user: String,   // req.user.username
  date: {type:Date, default:Date.now},
  dateUpdate: {type:Date, default:Date.now},  //update when any modification
  project: String,   // 项目名 project.name
  profession: String, // "请选择所属专业","土建","安装","钢结构", "幕墙", "装修","舞台", "其他"
  zone: String,   // collection: zones.zoneDescription
  title: String, 
  patrolType: String, //质量，日常 {routine, safety}
  text: String,     // 主体文字 描述
  file: String, // 不用
  files: Array, //附件. 批注：files.children.text
  caption: String,  // 附图/视频脚标题
  status: String,  //followup(responsible),closed
  responsible: String,  //username (by siteManager/admin)
  annotation: String,   //['正常','关注', '有问题', '有疑问'],  //巡视情况     m:xsqk
  keywords: String,  //later
  exposure: {type: String, default:'public'},  // visible to: private,siteManager,projectManager...
  parents: Array,  // array of id
  children: Array,   // comments 评论
  co:String,  // 'co' 施工单位可见
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
  description: String,
  owner: String,
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

const shareSchema = new mongoose.Schema({
  date: {type: Date, default: Date.now},
  dateUpdate: {type: Date, default: Date.now},
  user: String,

  filename: String,
  fileSize: Number,
  title: String,
  text: String,
  keywords: String,
  exposure: String
});
// Schema.index({'$**':'text'});
module.exports.Share = mongoose.model('Share', shareSchema);
