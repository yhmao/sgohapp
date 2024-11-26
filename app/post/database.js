
const HOST_DB = require('../../config.js').HOST_DB;
// ['MI_Local','MI_Ali','Ali_Ali']


const MI_Local = "mongodb://localhost:27017/sgoh-node";
const MI_Ali   = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const Ali_Ali  = "mongodb://admin:Flzx3000c@localhost:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

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


const Mongoose = require('mongoose').Mongoose;
const mongoose = new Mongoose();
mongoose.connect(uri)



// ----Post
const postSchema = new mongoose.Schema({
    user: {type:String,default:'user'},
    date: {type:Date, default:Date.now},
    dateUpdate: {type:Date, default:Date.now},  //update when any modification
    profession: String,
    title: String,
    text: String,     //for BodyFiles: = text
    files: Array, //allow multiple files. 批注：files.children.text
    keywords: Array,  
    exposure: {type: String, default:'public'},  // visible to: private,siteManager,projectManager...
    comments: Array,   // array of cmt
    up: {type:Number, default:0},
    down: {type:Number, default:0},
  });
  postSchema.index({'$**':'text'});
  module.exports.Post = mongoose.model('Post', postSchema);
  
  const commentSchema = new mongoose.Schema({
    created: {type: Date, default: Date.now()},
    modified: Date,
    text: String,    // comment content
    file: String,    // image, video, file attchment
    caption: String,   // explanation for file
  });
  module.exports.Comment = mongoose.model('Comment', commentSchema);  

  
  // ------