console.log('/routes/m.js');

var express = require('express');
var router = express.Router();
var db = require('../database');
var moment = require('moment');

var formidable = require('formidable');
var path = require('path');
var utils = require('../utils');
var fs = require('fs');

// parser for wx.uploadFile()
const form = formidable({
    multiples: true,
    uploadDir: `${__dirname}\/..\/upload`,
    keepExtensions: true,
    maxFileSize: 50*1024*1024,
    filename: function(name, ext, part, form){
        console.log('m formidable - name, ext: ', name, ext);
        if (name == 'invalid-name') { return '';}
        return utils.yyyymmdd_hhmmss() + '_' + name + ext;
    }
});



// authentication check nickname in db.users
router.post('/verify',function(req,res,next){
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
});

router.get('/verify', function(req,res,next){
  console.log('enter m GET /verify ...');
  res.send('You just requested: m/verify');
});

// get zones
router.get('/zones', function(req,res,next){
  console.log('enter m GET /zones/get...');
  db.Zone.find({},(err,zones)=>{
    res.json(zones);
  });
});

// create new record
router.post('/record_patrol_new/:username', function(req,res,next){
  console.log('enter m POST /record_patrol_new');
  var username = req.params.username;
  console.log('username:', username);
  var user = req.body.user;
  var patrolType = req.body.patrolType;
  console.log('user, patroType:', user, patrolType);
  var record = new db.Record({
    user:user,
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
}); 

// get record by id
router.get('/record_patrol/:id/:username', function(req,res,next){
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

});

// add comment

router.post('/record_patrol/:id/comment_add_text/:username', function(req,res,next){
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
});

router.post('/record_patrol/:id/comment_add/:username', function(req,res,next){
  console.log('enter POST /record_patrol/:id/comment_add');
  var username = req.params.username;
  console.log('username:', username);
  var id = req.params.id;
  console.log('record id:', id);
  form.parse(req, (err,fields,files)=>{
    if (err) {
      console.log('err in parsing form: ', err);
      next(err);
      return;
    }

    var user = fields.username;
    var text = fields.text;
    var file;
    if (files.file.originalFilename) {
      file = files.file.newFilename;
      console.log('newFilename:', file);
    }else{
      console.log('no file selected');
      file = "";
    }
    var parents = [id];
    var comment = new db.Comment({
      user: user,
      text:text,
      file:file,
      parents: parents
    });
    console.log('comment:', comment);

    if (file) {
      console.log('has file');
      comment.save(()=>{
        console.log('Added comment saved.');
        // add child to record
        db.Record.findById(id,(err,record)=>{
          console.log('refreshing record by updating children with new added comment');
          console.log('comment.id:', comment.id);
          // record.children.push(comment.id);
          record.children.push(comment);
          record.dateUpdate = Date.now();
          record.save((err,record)=>{
            res.send('添加评论成功(有附件)');

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
    }else{
      console.log('no file');
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
    }
  });
});

// remove comment
router.get('/record_patrol/:id/comment_remove/:cindex/:username', function(req,res,next){
  console.log('enter GET m /record_patrol/:id/comment_remove/:cindex');
  var username = req.params.username;
  console.log('username:', username);
  var id = req.params.id;
  var cindex = +req.params.cindex;
  console.log('id: ', id);
  console.log('cindex: ', cindex);
  db.Record.findById(id,(err,record)=>{
    var commentId = record.children[cindex]._id.toString();
    db.Comment.findById( commentId  , (err,comment)=>{
      if (comment.file != ''){
        console.log('comment.file:', comment.file);
        try{ 
          fs.unlinkSync(`${__dirname}\/..\/upload\/`+comment.file);
          console.log('comment.file:  removed.');
        }
        catch(err){console.log('err removing file:',err); }
      }
      db.Comment.findByIdAndDelete(commentId,()=>{
        record.children.splice(cindex,1);
        record.dateUpdate = Date.now();
        console.log('record.children.length: ', record.children.length);
        record.save((err,record)=>{
          res.json(record);
          console.log('comment removed.');

          //log
          var user = username;
          var url = req.originalUrl;
          var method = req.method;
          console.log('> log >', user, method, url);
          var log = new db.Log({user:user,method:method,url:url});
          log.save(()=>{ });

        })
      })
    });
  });
});



// remove body image(file) subdocument.
router.get('/record_patrol/:id/file_doc_remove/:fid/:username',function(req,res,next){
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
});

// remove record (need: no record.files, no record.children)
router.get('/record_patrol/:id/remove/:username',function(req,res,next){
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
});

// update body text: record.text => patrolType, zone, exposure, annotation
router.post('/body_text/:username',function(req,res,next){
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
  console.log('id,patroType,zone,profession, text,exposure,annotation:',id,patrolType, zone,profession, text,exposure,annotation);
  if (exposure == undefined) {exposure = 'public';}   
  db.Record.findById(id,(err,record)=>{
    record.patrolType = patrolType;
    record.zone = zone;
    record.profession = profession;
    record.text = text;
    record.exposure = exposure;
    record.annotation = annotation;
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
});

// Add file -> record.files
router.post('/body_file_plus/:username', function(req,res,next){
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
});

// 添加评论comment
router.post('/comment_plus', function(req,res,next){
  console.log('enter POST /comment_plus ...');
  form.parse(req, (err, fields, files)=>{
    var id = fields.id;
    var text = fields.text;
    var file = files.file.newFilename;
    var user = req.user.username;
    var parents = [id];
    console.log('files:', files);
    var comment = new db.Comment({text:text, file:file, user:user, parents:parents})
    console.log('new comment:', comment);
    comment.save(()=>{
      console.log('one comment saved.');
      db.Record.findById(id, (err,record)=>{
        if (err) {console.log('err db.Record.findById: ', err); next(err); return;}
        record.children.push(comment);
        record.dateUpdate = Date.now();
        record.save(()=>{
          console.log('record saved.');
          res.send('添加一条评论成功！');
        });
      });
    });
  });
});

// 更新图片说明
router.post('/main_FileText/:username',function(req,res,next){
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
});

// Full text search
/* 查询字符串，空格分词，结果含所有单词
   搜索：记录标题，附件说明，附件批注，评论文本。
*/
router.post('/text_search', function(req,res,next){
  console.log('enter POST m /text_search');
  var queryString = req.body.queryString;
  console.log('query:', queryString);

  var words = queryString.split(/(\s+)/).filter( e => e.trim().length > 0);
  console.log(words);
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
  var match = {$and: andList};
  console.log(match);
  var q = db.Record.aggregate([
    {$match:match},
    {$sort:{dateUpdate:-1} }
  ]);


  q.exec(function(err,records){
    res.json(records);
    console.log('records.length:', records.length);
  });

});


/* q: request from wechat miniprogram
  {
  date: { date: { dateFrom: '2023/2/26', dateTo: '2023/2/28' } },
  sort: { '$sort': { dateUpdate: -1 } },
  exposure: { exposure: 'private' },
  user: { user: 'maoyuhong' }
  }
  date: string => Date, swap if need.
*/
router.post('/record_patrol_list/search/:page/:username',async function(req,res,next){
  console.log('enter POST /record_patrol_list/search/:page');
  var username = req.params.username;
  console.log('username:', username);
  var page = req.params.page;
  console.log('page:', page);
  var q = req.body.q;
  
  console.log('q:', q);
  var {date,sort,exposure,user} = q;
  console.log('date:',date);
  console.log('sort:', sort);
  console.log('exposure:', exposure);
  console.log('user: ', user);

  var from = moment(new Date(date.date.dateFrom)).startOf('day').toDate();
  var to = moment(new Date(date.date.dateTo)).endOf('day').toDate();
  console.log('from <= to : ', from <= to);
  if (from > to ){ var temp = from; from = to; to = temp; }   //swap
  date = {'date':{$gte:from, $lte:to} };
  console.log('date: ',date);

  var andList = [date,exposure,user];    

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

  if (page == 0) {
    console.log('page ==0');
    var count = {$count:'total'};
    try {
      var agg = (await db.Record.aggregate([match,count]));
      console.log('aggregate:', agg);      
      var total = (await db.Record.aggregate([match,count]))[0].total;

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


  
});



module.exports = router;


