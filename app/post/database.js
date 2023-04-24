const mongoose = require('../../database.js').mongoose;


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
  const Post = mongoose.model('Post', postSchema);

  const cmtSchema = new mongoose.Schema({  // cmt == comment
    user: {type:String,default:'user'},
    date: {type:Date, default:Date.now},
    dateUpdate: {type:Date, default:Date.now},  //update when any modification
    text: String,     //for BodyFiles: = text
    files: Array, //allow multiple files. 批注：files.children.text
    parents: Array,  // array of id
  });
  const Cmt = mongoose.model('Cmt', cmtSchema);

  const fileSchema = new mongoose.Schema({
    user: {type:String,default:'user'},
    date: {type:Date, default:Date.now},
    dateUpdate: {type:Date, default:Date.now},  //update when any modification
    filePath: String,     //for BodyFiles: = text
    text: String,
    children:Array
  });
  const File = mongoose.model('File', fileSchema);

  module.exports = exports = {
      Post,
      File,
      Cmt
  }