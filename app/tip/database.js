
// change uri per project
// const uri = "mongodb://localhost:27017/tips";

//check computer and select mongodb connection uri
console.log('process.platform:',process.platform);
const os = require('os');
console.log('hostname:', os.hostname());

const MI = "DESKTOP-F1V3PN0";

const localSgoh =      "mongodb://localhost:27017/tips";
const localSgoh3Y =    "mongodb://admin:Flzx3000c@localhost:27017/tips?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const remoteYYO2Sgoh = "mongodb://admin:Flzx3000c@8.134.79.194:27017/tips?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

var uri;  //mongodb connection string for tips
if(os.hostname() == MI){
  console.log("running on windows MI.");
  uri = localSgoh;   // dev
  // uri = remoteYYO2Sgoh;    // production
}else if (os.hostname == "yyo2") {
  console.log("running on ali server yyo2 1y.");
  uri = remoteYYO2Sgoh;
}else {
  console.log("running on ali server 3y.");
  uri = localSgoh3Y;
}



const Mongoose = require('mongoose').Mongoose;
const mongoose = new Mongoose();
mongoose.connect(uri)

const tipSchema = new mongoose.Schema({
  created: {type: Date, default: Date.now()},
  modified: {type: Date, default: Date.now()},
  cat1: String,
  cat2: String,
  keywords: String,
  title: String,
  content: String,
  comments: []
}, {collection:'learn'});
// Schema.index({'$**':'text'});
const Tip = mongoose.model('learn', tipSchema);

const commentSchma = new mongoose.Schema({
  created: {type: Date, default: Date.now()},
  modified: {type: Date, default: Date.now()},
  text: String,    // comment content
  file: String,    // image, video, file attchment
  caption: String,   // explanation for file
});
const Comment = mongoose.model('Comment', commentSchma);

module.exports = {
    Tip,
    Comment,
};