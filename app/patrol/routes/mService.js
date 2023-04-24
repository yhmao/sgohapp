console.log('/routes/m.js');

var express = require('express');
var router = express.Router();

var db = require('../database');
var moment = require('moment');

var formidable = require('formidable');
var path = require('path');
var utils = require('../../../utils');
var fs = require('fs');

// parser for wx.uploadFile()
const form = formidable({
    multiples: true,
    uploadDir: `${__dirname}\/..\/..\/..\/upload`,
    // uploadDir: `/upload`,
    keepExtensions: true,
    maxFileSize: 50*1024*1024,
    filename: function(name, ext, part, form){
        console.log('m formidable - name, ext: ', name, ext);
        if (name == 'invalid-name') { return '';}
        return utils.yyyymmdd_hhmmss() + '_' + name + ext;
    }
});

// functions

let mlog = function(req) {
  console.log('log');
  let user = req.params.username;
  if (user) {
    let url = req.originalUrl;
    let method = req.method;
    console.log('> log >', user, method, url);
    var log = new db.Log({user:user,method:method,url:url});
    log.save();
  } else {
    console.log('no user information got from req, no log');
    return;
  }
};


// pipeline text
let pt = function(qs) {
  console.log('qsToAl');
  let words = qs.split(/(\s+)/).filter( e => e.trim().length > 0);
  // console.log(words);
  let andList = [];
  words.forEach(function(word){
    let orList = [
        {"text":{$regex:word, $options:"i"}},
        {"files.text":{$regex:word, $options:"i"}},
        {"children.text":{$regex:word, $options:"i"}},
        {"files.children.text":{$regex:word, $options:"i"}},
      ];
    andList.push({$or:orList});
  } );
  let pt = {$match:{$and: andList}};
  return pt;
};

// pipeline common
let pc = function(req) {
  console.log('pc pipeline common');
  let q = req.body.q.q;

  // console.log('q:', q);
  // console.log('q:', JSON.stringify(q));

  let project = q.project;
  let date = q.date || {};
  let sort = q.sort || {};
  let exposure = q.exposure || {};
  let user = q.user || {};
  let patrolType = q.patrolType || {};
  let status = q.status || {};
  let responsible = q.responsible || {};
  let co = q.co || {};

  // console.log('project:', project);
  // console.log('date:',date);
  // console.log('sort:', sort);
  // console.log('exposure:', exposure);
  // console.log('user: ', user);
  // console.log('patrolType:', patrolType);
  // console.log('status:', status);
  // console.log('responsible:', responsible);
  //
  // console.log('date:',date);

  let from = moment(new Date((date.date && date.date.dateFrom) || (date.dateUpdate && date.dateUpdate.dateFrom))).startOf('day').toDate();
  let to = moment(new Date((date.date && date.date.dateTo) || (date.dateUpdate && date.dateUpdate.dateTo))).endOf('day').toDate();
  // console.log('from <= to : ', from <= to);
  if (from > to ){ var temp = from; from = to; to = temp; }   //swap
  // console.log('sort:',sort);
  if (sort.$sort.dateUpdate === -1) { date = {'dateUpdate':{$gte:from, $lte:to} }; }
  else if (sort.$sort.date === -1 ) { date = {'date':{$gte:from, $lte:to} }; }
  // console.log('date: ',date);

  let andList = [date,project,exposure,user,patrolType,status,responsible,co];

  let pc = {$match:{$and:andList} };

  // console.log('pc:', JSON.stringify(pc));

  return pc;
};

// total aggregate pipeline
let getTotal = async function(p) {
  console.log('getTotal');
  let count = {$count: 'total'};
  let pipelines;
  if (Array.isArray(p)) { pipelines = [...p,count]; }
  else { pipelines = [p,count]; }
  let total;
  try {
    let agg = (await db.Record.aggregate(pipelines));
    // console.log('aggregate:', agg);
    if (agg.length>0) { total = (await db.Record.aggregate(pipelines))[0].total; }
    else {
      console.log('aggregate result in nothing');
      total = 0;
    }
  } catch (err) {
    console.log('error calculating total, err:', err);
    total = 0;
  }
  console.log('total:', total);
  return total;
};


///////////////////////////////////////////////



// authentication check nickname in db.users
let verifyPost = function(req,res,next){
  console.log('enter m POST /verify ...');
  var nickname = req.body.nickname;
  console.log('req.body:', req.body);
  db.User.findOne({'nickname':nickname},function(err,user){
    if (err) { console.log('用户名非法'); res.send(""); }
    res.json(user);
    console.log('/verify done successfully.');

    //log
    var user = user.username;
    var url = req.originalUrl;
    var method = req.method;
    console.log('> log >', user, method, url);
    var log = new db.Log({user:user,method:method,url:url});
    log.save(()=>{ });
  });
};


let verifyGet = function(req,res,next){
  console.log('enter m GET /verify ...');
  res.send('You just requested: m/verify');
};


// get zones
let zones = function(req,res,next){
  console.log('enter m GET /zones/get...');
  db.Zone.find({},(err,zones)=>{
    res.json(zones);
  });
};



// create new record
let create = function(req,res,next){
  console.log('enter m POST /record_patrol_new');
  var username = req.params.username;
  console.log('username:', username);
  var user = req.body.user;
  var patrolType = req.body.patrolType;
  let project = req.body.project;
  console.log('user, patroType,project:', user, patrolType,project);
  var record = new db.Record({
    user:user,
    project:project,
    patrolType:patrolType,
    annotation:"正常"
  });
  record.save(()=>{
    res.json(record);
    console.log(`new record created with id 【${record._id}】.`);

    //log
    var user = username;
    var url = req.originalUrl;
    var method = req.method;
    console.log('> log >', user, method, url);
    var log = new db.Log({user:user,method:method,url:url});
    log.save(()=>{ });

  });
}



// get record by id
let show = function(req,res,next){
  console.log('enter GET /record_patrol/:id');
  var id = req.params.id;
  console.log('id:', id);
  db.Record.findById(id,(err,record)=>{
    res.json(record);
    console.log(`one record with id 【${id}】 sent to client.`);
  });

  var username = req.params.username;
  console.log('username:', username);
  //log
  var user = username;
  var url = req.originalUrl;
  var method = req.method;
  console.log('> log >', user, method, url);
  var log = new db.Log({user:user,method:method,url:url});
  log.save(()=>{ });

};

// add comment

let addCommentTextOnly = function(req,res,next){
  console.log('enter POST /record_patrol/:id/comment_add_text');
  var username = req.params.username;
  console.log('username:', username);
  var id = req.params.id;
  var user = req.body.user;
  var text = req.body.text;
  var file = '';
  console.log('id, user, text: ', id, user, text);
  var parents = [id];
  var comment = new db.Comment({
    user:user, text:text, file:file,parents:parents
  });
  // console.log('comment:', comment);
  comment.save(()=>{
    console.log('comment saved.');
    db.Record.findById(id,(err,record)=>{
      console.log('refreshing record by updating children with new added comment');
      console.log('comment.id:', comment.id);
      record.children.push(comment);
      record.dateUpdate = Date.now();
      record.save((err,record)=>{
        res.send('添加评论成功(没有附件)');

        //log
        var user = username;
        var url = req.originalUrl;
        var method = req.method;
        console.log('> log >', user, method, url);
        var log = new db.Log({user:user,method:method,url:url});
        log.save(()=>{ });

      });
    });
  });
};


// remove comment
let removeComment = function(req,res,next){
  console.log('app/patrol/routes/mService removeComment');
  console.log('enter GET m /record_patrol/:id/comment_remove/:cindex/:username');
  var username = req.params.username;
  console.log('username:', username);
  var id = req.params.id;
  var cindex = +req.params.cindex;
  console.log('id: ', id);
  console.log('cindex: ', cindex);
  db.Record.findById(id, (err,record)=>{
    let comment = record.children[cindex];
    if ( comment.children && comment.children.length > 0 ) {
      console.log('comment has children, reject to remove');
      res.send('评论有批注，请先删除批注后再删除该评论！');
      return;
    }
    if (comment.file != '') {
      console.log('comment.file:', comment.file);
      try {
        let path = `${__dirname}\/..\/..\/..\/upload\/${comment.file}`;
        console.log('path:', path);
        fs.unlinkSync(path);
        console.log('comment file removed.');
      }
      catch (err) {console.log('err removing file: ', err); return;}
    }
    record.children.splice(cindex,1);
    record.dateUpdate = Date.now();
    record.save((err,record)=>{
      res.send('已成功移除一条评论！');
      console.log('comment removed');
      //log
      var user = username;
      var url = req.originalUrl;
      var method = req.method;
      console.log('> log >', user, method, url);
      var log = new db.Log({user:user,method:method,url:url});
      log.save(()=>{ });
    })
  });
};



// remove body image(file) subdocument.
let removeFileDoc = function(req,res,next){
  console.log('enter GET m /record_patrol/:id/file_doc_remove/:fid ...');
  var username = req.params.username;
  console.log('username:', username);
  var id = req.params.id;
  var fid = req.params.fid;
  db.Record.findById(id, (err,record)=>{
    var index = record.files.map(file=>file._id.toString()).indexOf(fid);
    var filename = record.files[index].file;
    var text = record.files[index].file.text;
    console.log('index:',index);
    if (record.files[index].children.length > 0 ) { res.send('本项有批注，不能删除！'); return;}
    else {
          try{fs.unlinkSync(`${__dirname}\/..\/upload\/${record.files[index].file}`);}
          catch(err){console.log('err removing file:', err);}
          record.files.splice(index,1);
          record.markModified('files');
          record.save((err,record)=>{
            res.json(record);
            console.log('removed one file from record.files');
          });

          //log
          var user = username;
          var url = req.originalUrl;
          var method = req.method;
          console.log('> log >', user, method, url);
          var log = new db.Log({user:user,method:method,url:url});
          log.save(()=>{ });
    }
  });
};

// remove record (need: no record.files, no record.children)
let removeRecord = function(req,res,next){
  console.log('enter GET m record_patrol/:id/remove');
  var username = req.params.username;
  console.log('username:', username);
  var id = req.params.id;
  db.Record.findById(id,(err,record)=>{
    if ( record.children.length > 0 ) {
      console.log('record has comments, rejected.');
      res.send('请先删除所有评论再尝试删除记录。');
      next();
    }
    else if ( record.files.length > 0 ) {
      console.log('record has attached files, rejected.');
      res.send("请先删除记录中上传的文件，再尝试删除记录。")
      next();
    }
    else {
      db.Record.findByIdAndDelete(id,(err,record)=>{
        console.log('record deleted');
        res.send(`成功删除id为【${id}】，描述为【${record.text}】的记录。`);

        //log
        var user = username;
        var url = req.originalUrl;
        var method = req.method;
        console.log('> log >', user, method, url);
        var log = new db.Log({user:user,method:method,url:url});
        log.save(()=>{ });

    })
    }
  });
};

let addFileComment = function(req,res,next) {
  console.log('enter POST m /record_patrol/:id/files/:fileIndex/comment/:username');
  console.log('addFileComment');
  let id = req.params.id;
  let fileIndex = req.params.fileIndex;
  fileIndex = parseInt(fileIndex);
  let commentContent = req.body.commentContent;
  let user = req.params.username;
  console.log('id, fileIndex, commentContent:', id, fileIndex, commentContent);
  let comment = db.FileComment({user:user,text:commentContent});
  console.log('comment:', comment);
  db.Record.findById(id,(err,record)=>{
    if(err) {console.log('err findbyId');return;}
    console.log('record.files[fileIndex].children:', record.files[fileIndex].children);
    record.files[fileIndex].children.push(comment);
    record.markModified('files');
    record.save(()=>{
      res.send(`成功添加评论: ${commentContent}!`)
    });
  })

};

let addCommentComment = function(req,res,next) {
  console.log('enter POST m /record_patrol/:id/children/:commentIndex/comment/:username');
  console.log('addCommentComment');
  let id = req.params.id;
  let commentIndex = req.params.commentIndex;
  commentIndex = parseInt(commentIndex);
  let commentContent = req.body.commentContent;
  let user = req.params.username;
  console.log('id, commentIndex, commentContent:', id, commentIndex, commentContent);
  let comment = db.FileComment({user:user,text:commentContent});
  console.log('comment:', comment);
  db.Record.findById(id,(err,record)=>{
    if(err) {console.log('err findbyId');return;}
    console.log('record.children[commentIndex].children:', record.children[commentIndex].children);
    record.children[commentIndex].children.push(comment);
    record.markModified('children');
    record.save(()=>{
      res.send(`成功添加评论: ${commentContent}!`)
    });
  })

};


// update body text: record.text => patrolType, zone, exposure, annotation
let updateBodyText = function(req,res,next){
  console.log('enter POST m /body_text');
  var username = req.params.username;
  console.log('username:', username);

  var id = req.body.id;
  var patrolType = req.body.patrolType;
  var zone = req.body.zone;
  var profession = req.body.profession;
  var text = req.body.text;
  var exposure = req.body.exposure;
  var annotation = req.body.annotation;
  var co = req.body.co;
  console.log('id,patroType,zone,profession, text,exposure,annotation,co:',id,patrolType, zone,profession, text,exposure,annotation,co);
  if (exposure == undefined) {exposure = 'public';}
  db.Record.findById(id,(err,record)=>{
    record.patrolType = patrolType;
    record.zone = zone;
    record.profession = profession;
    record.text = text;
    record.exposure = exposure;
    record.annotation = annotation;
    record.co = co;
    record.dateUpdate = Date.now();
    record.save(()=>{
      res.json(record);
      console.log('body text updated.');

      //log
      var user = username;
      var url = req.originalUrl;
      var method = req.method;
      console.log('> log >', user, method, url);
      var log = new db.Log({user:user,method:method,url:url});
      log.save(()=>{ });

    });
  });
};

// Add file -> record.files
let addRecordFile = function(req,res,next){
  console.log('app/patrol/routes/mService  addRecordFile...');
  console.log('enter POST m /body_file_plus...');
  var username = req.params.username;
  console.log('username:', username);
  form.parse(req, (err,fields,files)=>{
    if (err) {console.log('err:',err); next(err); return;}
    var id = fields.id;
    var text = fields.text;
    var username = fields.username;
    var file = files.file.newFilename;
    console.log('id:', id);
    console.log('username:', username);
    console.log('text:', text);
    console.log('fields:',fields);
    console.log('files.file.size:',files.file.size);
    console.log('files.file.newFilename:', files.file.newFilename);

    db.Record.findById(fields.id.trim(),(err,record)=>{
      if(err){console.log('err db.Record.findById:',err); return;}
      var bodyFile = new db.BodyFile({user:username, text:text, file:file});
      bodyFile.save((err)=>{
        console.log('bodyFile saved.');
        db.Record.findByIdAndUpdate(id, {$push: {"files": bodyFile},$set:{'dateUpdate':Date.now()}}, function(err,record){
          console.log('record updated.');
          db.Record.findById(id,(err,record)=>{
            res.json(record);
            console.log('saved one uploaded file.');

            //log
            var user = username;
            var url = req.originalUrl;
            var method = req.method;
            console.log('> log >', user, method, url);
            var log = new db.Log({user:user,method:method,url:url});
            log.save(()=>{ });

          });
        });
      });
    });
  });
};

// 添加评论comment
let addComment = function(req,res,next){
  console.log('app/patrol/routes/mService addCommnent');
  console.log('enter POST /record_patrol/:id/comment_add/:username ...');
  let username = req.params.username;
  let id = req.params.id;
  form.parse(req, (err, fields, files)=>{
    var text = fields.text;
    var file = files.file.newFilename;
    console.log('files:', files);
    var comment = new db.Comment({text:text, file:file, user:username})
    console.log('new comment:', comment);
    db.Record.findById(id, (err,record)=>{
      if(err) { console.log('err db.Record.findById: ', err); next(err);}
      console.log('record:', record);
      record.children.push(comment);
      record.dateUpdate = Date.now();
      record.markModified('children');
      record.save((err,record)=>{
        if(err) { console.log('err db.Record.save: ', err); next(err);}
        console.log('record saved.');
        res.send('添加一条评论成功！');
      });
    });
  });
};

// 更新图片说明
let updateBodyFileText = function(req,res,next){
  console.log('enter POST m /main_FileText');
  console.log('req.body:', req.body);
  var username = req.params.username;
  console.log('username:', username);
  var id = req.body.id;
  var fileId = req.body.fileId;
  var text = req.body.text;
  console.log("id, fileId, text:", id, fileId,text)

  db.Record.findById(id, (err,record)=>{
    var index = record.files.map(file=>file._id.toString()).indexOf(fileId);
    record.files[index].text = text;
    record.dateUpdate = Date.now();
    record.markModified('files');
    record.save(()=>{
      console.log('record saved.');
      db.Record.findById(id, (err,record)=>{
        if (err) {console.log('err:', err);}
        res.json(record);
      });
      console.log(`图片说明已更新为: ${text}！`);

      //log
      var user = username;
      var url = req.originalUrl;
      var method = req.method;
      console.log('> log >', user, method, url);
      var log = new db.Log({user:user,method:method,url:url});
      log.save(()=>{ });

    });
  });
};

// Full text search
/* 查询字符串，空格分词，结果含所有单词
   搜索：记录标题，附件说明，附件批注，评论文本。
*/
let searchText =  async function(req,res,next){
  console.log('enter POST m /text_search/:page/:username');
  let user = req.params.username;
  let page = parseInt(req.params.page);
  let sort = req.body.q.q.sort || {};
  sort = sort.$sort.dateUpdate? '-dateUpdate' : '-date';      // sort


  var queryString = req.body.queryString;  // search text
  // console.log('query:', queryString);

  let p1 = pt(queryString);    // text => query obj => pipeline
  console.log('p1:',p1);

  let p2 = pc(req);           // constraints options  = > query obj => pipeline
  console.log('p2:', p2);

  let skip = 0;
  if ( page > 0 ) {skip = ( (page-1) * 20 ); }

  // console.log('page:', page);

  let total = await getTotal([p1,p2]);     // total found
  console.log('total:', total);

  let pages = Math.ceil(total/20);
  // console.log('pages:', pages);      

  let hResult = function(records){    // handler success
    console.log('hResult');
    if ( records ) { console.log(`found ${records.length} document results.`)}
    if ( !records ) { console.log('not found any result document.'); }
    console.log('records.length:', records.length);
    mlog(req);
    res.json({records,pages,total});
  }; 
  let hError = function(err) {    // handler error
    console.log('hError');
    if (err) { console.log('err Db query: ', err); return; }
  };  

  db.Record
    .aggregate( [p1,p2] )
    .sort(sort)
    .skip(skip)
    .limit(20)
    .then(hResult,hError);     // result = > res.json()

};


/* q: request from wechat miniprogram
  {
  date: { date: { dateFrom: '2023/2/26', dateTo: '2023/2/28' } },
  sort: { '$sort': { dateUpdate: -1 } },
  exposure: { exposure: 'private' },
  user: { user: 'maoyuhong' }
  }
  date: string => Date, swap if need.
*/
let pagination = async function(req,res,next){
  console.log('app/patrol/routes/mService/pagination');
  console.log('enter POST /record_patrol_list/search/:page');
  var username = req.params.username;
  console.log('username:', username);
  var page = req.params.page;
  console.log('page:', page);
  var q = req.body.q;

  console.log('q:', q);

  let project = q.project;
  let date = q.date || {};
  let sort = q.sort || {};
  let exposure = q.exposure || {};
  let user = q.user || {};
  let patrolType = q.patrolType || {};
  let status = q.status || {};
  let responsible = q.responsible || {};
  let co = q.co || {};

  console.log('project:', project);
  console.log('date:',date);
  console.log('sort:', sort);
  console.log('exposure:', exposure);
  console.log('user: ', user);
  console.log('patrolType:', patrolType);
  console.log('status:', status);
  console.log('responsible:', responsible);

  console.log('date:',date);

  var from = moment(new Date((date.date && date.date.dateFrom) || (date.dateUpdate && date.dateUpdate.dateFrom))).startOf('day').toDate();
  var to = moment(new Date((date.date && date.date.dateTo) || (date.dateUpdate && date.dateUpdate.dateTo))).endOf('day').toDate();
  console.log('from <= to : ', from <= to);
  if (from > to ){ var temp = from; from = to; to = temp; }   //swap
  console.log('sort:',sort);
  if (sort.$sort.dateUpdate === -1) { date = {'dateUpdate':{$gte:from, $lte:to} }; }
  else if (sort.$sort.date === -1 ) { date = {'date':{$gte:from, $lte:to} }; }
  console.log('date: ',date);

  var andList = [date,project,exposure,user,patrolType,status,responsible,co];

  match = {$match:{$and:andList} };

  console.log('match:', JSON.stringify(match));

  var skip;
  if (page == 0) {
    skip = {$skip: 0};
  }
  else if (page > 0) {
    skip = {$skip: (page-1)*20 };
  }
  console.log('skip:', skip);
  var limit = {$limit: 20};
  var pipeline = [match,sort,skip,limit];
  console.log('pipeline:', pipeline);

  let total;
  if (page == 0) {
    console.log('page ==0');
    var count = {$count:'total'};
    try {
      var agg = (await db.Record.aggregate([match,count]));
      console.log('aggregate:', agg);
      if (agg.length>0) { total = (await db.Record.aggregate([match,count]))[0].total; }
      else {
        console.log('aggregate result in nothing');
        total = 0;
      }

    } catch (err) {
      console.log('error calculating total, err:', err);
      total = 0;
    }

    console.log('total:', total);
    var pages = Math.ceil(total/20);
    console.log('pages:', pages);

    q = db.Record.aggregate(pipeline);

    await q.exec(function(err,records){
      res.json({total:total, pages:pages, records:records});
      console.log('records.length:', records.length);
      console.log('res.json sent to client.');

      //log
      var user = username;
      var url = req.originalUrl;
      var method = req.method;
      console.log('> log >', user, method, url);
      var log = new db.Log({user:user,method:method,url:url});
      log.save(()=>{ });

    });
  } else if (page > 0) {
    console.log('page > 0');
    q = db.Record.aggregate(pipeline);
    await q.exec(function(err,records){
      res.json(records);
      console.log('records.length:', records.length);
      console.log('res.json sent to client.');

      //log
      var user = username;
      var url = req.originalUrl;
      var method = req.method;
      console.log('> log >', user, method, url);
      var log = new db.Log({user:user,method:method,url:url});
      log.save(()=>{ });

    });

  }



};

let paginationCo = async function(req,res,next) {
  console.log('app/patrol/routes/mService paginationCo');
  console.log('/record_patrol_list/search/co/:page/:username');
  console.log('req.user:', req.user);
  let username = req.params.username;
  let page = req.params.page;
  let q = req.body.q;

  let sort = q.sort || {};
  let date = q.date || {};
  let from = moment(new Date(date.date.dateFrom)).startOf('day').toDate();
  let to = moment(new Date(date.date.dateTo)).endOf('day').toDate();
  console.log('from <= to : ', from <= to);
  if (from > to ){ let temp = from; from = to; to = temp; }   //swap
  date = {'date':{$gte:from, $lte:to} };
  console.log('date: ',date);

  let user = await db.User.findOne({username:username});
  req.user = user;

  let p = new RegExp( req.user.projects[0].slice(0,-3), "i" );
  console.log('regex p: ', p);

  let project = {project: { "$regex": p }};
  console.log('query of project:', project);
  let co = {co: "co"};

  let andList = [date, project, co];

  let match = {$match: {$and: andList }};

  console.log('match:', JSON.stringify(match));

  let skip;
  if (page == 0) {
    skip = {$skip: 0};
  }
  else if (page > 0) {
    skip = {$skip: (page-1)*20 };
  }
  console.log('skip:', skip);
  let limit = {$limit: 20};
  let pipeline = [match,sort,skip,limit];
  console.log('pipeline:', pipeline);

  let total;
  if (page == 0) {
    console.log('page ==0');
    var count = {$count:'total'};
    try {
      var agg = (await db.Record.aggregate([match,count]));
      console.log('aggregate:', agg);
      if (agg.length>0) { total = (await db.Record.aggregate([match,count]))[0].total; }
      else {
        console.log('aggregate result in nothing');
        total = 0;
      }

    } catch (err) {
      console.log('error calculating total, err:', err);
      total = 0;
    }

    console.log('total:', total);
    var pages = Math.ceil(total/20);
    console.log('pages:', pages);

    q = db.Record.aggregate(pipeline);

    await q.exec(function(err,records){
      res.json({total:total, pages:pages, records:records});
      console.log('records.length:', records.length);
      console.log('res.json sent to client.');

      //log
      var user = username;
      var url = req.originalUrl;
      var method = req.method;
      console.log('> log >', user, method, url);
      var log = new db.Log({user:user,method:method,url:url});
      log.save(()=>{ });

    });
  } else if (page > 0) {
    console.log('page > 0');
    q = db.Record.aggregate(pipeline);
    await q.exec(function(err,records){
      res.json(records);
      console.log('records.length:', records.length);
      console.log('res.json sent to client.');

      //log
      var user = username;
      var url = req.originalUrl;
      var method = req.method;
      console.log('> log >', user, method, url);
      var log = new db.Log({user:user,method:method,url:url});
      log.save(()=>{ });

    });

  }



};

let removeFileDocPz = function(req,res,next) {
  console.log('app/patrol/routes/mService removeFileDocPz');
  console.log('GET m /record_patrol/:id/file_doc/:fIndex/pz/:pzIndex/remove/:username');
  let user = req.params.username;
  let id = req.params.id;
  let fIndex = req.params.fIndex;
  let pzIndex = req.params.pzIndex;
  console.log('user, id, fIndex, pzIndex:', user, id, fIndex,pzIndex);
  db.Record.findById(id, (err,record)=>{
    if (err) { console.log('err db.Record.findById:',err); next(err); return;}
    // delete record.files[fIndex].children[pzIndex];
    record.files[fIndex].children.splice(pzIndex,1);
    record.dateUpdate = Date.now();
    record.markModified('files');
    record.save((err,record)=>{
      console.log(`deleted pizhu of files[${fIndex}]index ${pzIndex}`);
      res.send('成功删除一条附件的批注！');
    })
  });
};

let removeCommentPz = function(req,res,next) {
  console.log('app/patrol/routes/mService removeCommentPz');
  console.log('GET m /record_patrol/:id/comment/:cIndex/pz/:pzIndex/remove/:username');
  let user = req.params.username;
  let id = req.params.id;
  let cIndex = req.params.cIndex;
  let pzIndex = req.params.pzIndex;
  db.Record.findById(id, (err,record)=>{
    if (err) { console.log('err db.Record.findById:',err); next(err); return;}
    record.children[cIndex].children.splice(pzIndex,1);
    record.dateUpdate = Date.now();
    record.markModified('children');
    record.save((err,record)=>{
      console.log(`deleted pizhu of comments[${cIndex}]index ${pzIndex}`);
      res.send('成功删除一条评论的批注！');
    })
  });
};

//批注
let addPz = function(req,res,next) {
  console.log('app/patrol/routes/mService addPz');
  console.log('POST m /record_patrol/:id/:type/:index/pz/add/:username');
  let id = req.params.id;
  let type = req.params.type;
  let index = req.params.index;
  let user = req.params.username;
  console.log('req.body:', req.body);
  let text = req.body.commentContent;
  let pz ;
  console.log('id, type, index, user:', id, type, index, user);
  console.log('text:', text);
  let responsible = req.body.responsible;
  console.log('responsible:', responsible);
  db.Record.findById(id, (err, record)=>{
    if ( type === 'file' ) {
      if ( text ) {
        pz = new db.Review({user:user,text:text});
        record.files[index].children.push(pz);
      }
      if (responsible) { record.files[index].responsible = responsible; record.status = "跟进"; }
      record.markModified('files');
    } else if ( type === 'comment' ) {
      if ( text ) {
        pz = new db.Review({user:user,text:text});
        record.children[index].children.push(pz);
      }
      if (responsible) { record.children[index].responsible = responsible; record.status = "跟进"; }
      record.markModified('children');
    } else {
      console.log( 'neither file or comment selected for adding pz!');
    }
    record.dateUpdate = Date.now();
    record.save((err,record)=>{
      if (err) { console.log('err record.save: ', err); res.send('保存批注出错！'); return;}
      res.send('添加批注成功！');
    })
  });
};

let getResponsibleUsers = function(req,res,next) {
  console.log('app/patrol/routes/mService getResponsibleUsers');
  console.log('/users_responsible');
  db.User.find({selectable:1},{_id:0,username:1},function(err,usernames){
    console.log('usernames:', usernames);
    usernames = usernames.map(item => item.username);
    console.log('usernames:', usernames);
    res.json(usernames);
  });
};






module.exports = exports = {
    verifyGet,
    verifyPost,
    zones,
    create,
    show,
    addCommentTextOnly,
    removeComment,
    removeFileDoc,
    removeRecord,
    addFileComment,
    addCommentComment,
    updateBodyText,
    addRecordFile,
    addComment,
    updateBodyFileText,
    searchText,
    pagination,
    paginationCo,
    removeFileDocPz,
    removeCommentPz,
    addPz,
    getResponsibleUsers,
};
