console.log('/utils.js');
const moment = require('moment');
const path = require('path');

const Jimp = require('jimp');
const sizeOf = require('image-size');

const IMAGE_EXTS = ['jpeg', 'png', 'bmp', 'tiff', 'gif','jpg'];

// module.export.IMAGE_EXTS = IMAGE_EXTS;

let yyyymmdd_hhmmss = function(){
  var date = new Date();
  var yyyymmdd_hhmmss = date.getFullYear() + ("0" + (date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '_'
    + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
  // console.log('utils.js => yyyymmdd_hhmmss:', yyyymmdd_hhmmss);
  return yyyymmdd_hhmmss;
};


let downsizeImage = function(originalImage,cb){  // params: full path
  console.log('downsizeImage...');
  console.log('originalImage: ', originalImage);
  if ( !IMAGE_EXTS.includes(originalImage.split('.').pop().toLowerCase())) { console.log('not an image file for downsizing, return directly.');return cb(); }  // not an image file path
  else
  {
    try{
      Jimp.read(originalImage, (err,image)=>{
        if (err) {
          console.log('Jimp.read err:', err);
          return cb();
        }
        else
        {
          // var dimensions = sizeOf(image);
          console.log('originalImage dimensions:', image.bitmap.width, image.bitmap.height);
          var w = image.bitmap.width;
          var h = image.bitmap.height;
          var max = Math.max(w,h);
          console.log('max: ', max);

          if (w>=h){ console.log('max w :', w);}
          else{console.log('max h :', h);}

          if (image.bitmap.width <= 500) {console.log('image width <= 500, no need to downsize.'); return cb(); } // no downsize for image width <= 400
          else
          {
            image.resize(500, Jimp.AUTO);
            console.log('resized to 500 x AUTO');
            image.write(originalImage,cb);
            console.log('in function downsizeImage,  finished downsizeImage.');
            return;
          }
        }
      });
    }
    catch(error){
      console.log(`error in downsizeImage: ${orginalImage}, and the error message is: \n ${error}`);
      return cb();
    }    
  }
};

let randomString = function(len) {
  var buf = [];
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charlen = chars.length;
  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen-1)]);
  }
  return buf.join('');
};
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

let makeTextSearch = function(text){
  // text sentence => {$and: [ {$or:orList}, ...  ]} or { } 
  console.log('function makeTextSearch...');
  console.log('input:', text);
  if ( text == '' ) { console.log("text == ''"); text = {};}
  else {
    console.log("text !== ''");
    var words = text.split(/(\s+)/).filter( e => e.trim().length > 0);
    console.log('split to list:', words);
    var andList = [];
    words.forEach(function(word){
      let orList = [
          {"text":{$regex:word, $options:"i"}},
          {"files.text":{$regex:word, $options:"i"}},
          {"children.text":{$regex:word, $options:"i"}},
          {"files.children.text":{$regex:word, $options:"i"}},		
        ];	
      andList.push({$or:orList});	
    } );
    text = {$and: andList};
  }
  // console.log('returning text stringify:', JSON.stringify(text));
  return text;
};


let dateSpanObject = function(start,end){
  // start: 10/30/2022, end: 03/08/2023
  // => { '$gte': 2022-10-30T16:00:00.000Z, '$lte': 2023-03-04T15:59:59.999Z }
  let from,to;
  if (start) { from = moment(new Date(start)).startOf('Day').toDate(); }
  if (start == '') { from = moment(new Date()).startOf('Day').toDate();}
  if (end) { to = moment(new Date(end)).endOf('Day').toDate();};
  if (end == '') { to = moment(new Date()).endOf('Day').toDate();};
  console.log('from:',from);
  console.log('to:',to);
  let dateSpanObj = { $gte: from, $lte: to };
  console.log('returning dateSpanObj:', dateSpanObj);
  return dateSpanObj;
}

let setInitialQuery = function(user) {  
  let q = { project: user.projects[0], };
  q.exposure = {$ne:"private"};
  if (user.co === 'co') {q.co = user.co;};
  if (user.role === 'projectManager') {q.exposure = 'projectManager';}
  return q;
};

let setInitialQList = function(user) {
  let qList = [];
  qList.push({ project: user.projects[0]});
  qList.push({ exposure: {$ne:"private"} });  
  if (user.co === 'co') {qList.push({co:user.co});}
  if (user.role === 'projectManager') { qList.push( {exposure: {$ne:"private"} });}
  return qList;
};

let test = function (req, res, next) {
  let {method,protocol,ip,baseUrl,path,orginalUrl,route} = req;
  let functionPath = `${module.filename} this: ${this}`;
  let config = {functionPath, method, protocol, ip,baseUrl,path,  orginalUrl,route, }
  res.json(config);
};



module.exports = exports = {
  yyyymmdd_hhmmss,
  downsizeImage,
  randomString,
  makeTextSearch,
  dateSpanObject,
  setInitialQuery,
  setInitialQList,
  test,
}

module.exports.makeTextSearchShare = function(text){
  // text sentence => {$and: [ {$or:orList}, ...  ]} or { } 
  console.log('function makeTextSearch...');
  console.log('input:', text);
  if ( text == '' ) { console.log("text == ''"); text = {};}
  else {
    console.log("text !== ''");
    var words = text.split(/(\s+)/).filter( e => e.trim().length > 0);
    console.log('split to list:', words);
    var andList = [];
    words.forEach(function(word){
      let orList = [
          {"filename":{$regex:word, $options:"i"}},
          {"title":{$regex:word, $options:"i"}},
          {"text":{$regex:word, $options:"i"}},
          {"keywords":{$regex:word, $options:"i"}},		
        ];	
      andList.push({$or:orList});	
    } );
    text = {$and: andList};
  }
  // console.log('returning text stringify:', JSON.stringify(text));
  return text;
};