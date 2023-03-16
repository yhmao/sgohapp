


console.log('/routes/test.js');

var multer = require('multer');
var path = require('path');
var utils = require('../utils');
var formidable = require('formidable');
var db = require('../database.js');

const storage = multer.diskStorage({
  destination: function(req,file,cb){
    console.log('storage destination.');
    cb(null, 'upload')
  },
  filename: function(req,file,cb){
    console.log("storage filename");
    cb(null, utils.yyyymmdd_hhmmss() + '_' + file.originalname);
  }
});
const upload = multer({storage:storage});

const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  // allowEmptyFiles:false,
  // minFileSize:2000,
  filename: function (name, ext, part, form){   //control newFilename
    console.log('name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});

const myusername = 'user1';
const mypassword = 'mypassword';
var session;


var match = {"$match":{"$and":[
    {"dateUpdate":{"$gte":"2022-10-31T16:00:00.000Z","$lte":"2023-03-07T15:59:59.999Z"}},
    {},
    {},
    {"$and":[
      {"$or":
        [{"text":{"$regex":"歌剧","$options":"i"}},
        {"files.text":{"$regex":"歌剧","$options":"i"}},
        {"children.text":{"$regex":"歌剧","$options":"i"}},
        {"files.children.text":{"$regex":"歌剧","$options":"i"}}
      ]}]}
  ]
}};


 

async function agg(){
  console.log('async function...');

  var count =  await db.Record.count({date: {$gt:new Date("2023-03-07") }});
  console.log('count:', count);
  // var ag = await db.Record.aggregate([match]);
  var ag =  db.Record.aggregate([
    {$match:{date: {$gt:new Date("2023-03-07") }} }    
  ]);
  // ag.pipeline([{$count:'count'}]);
  // await ag.aggregate();
  ag1 =  ag.count('count');
  console.log('ag1:', ag1[0].count);
  ag = await ag.exec()
  console.log('ag:', ag);
  console.log('----------------');
};

agg();


