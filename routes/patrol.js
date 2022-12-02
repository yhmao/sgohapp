var db = require('../database');
var fs = require('fs');
var moment = require('moment');
console.log('user.js.');

// upload
var multer = require('multer');
const formidable = require('formidable');
var path = require('path');
var utils = require('../utils');
var fs = require('fs');

const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){   //control newFilename
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});


/////////////////////////test query string//////////////////////////////////
var start = moment().startOf('day');
var end = moment().endOf('day');
console.log('Start: ', start);
console.log(start.format('YYYY-MM-DD HH-mm-ss'));
console.log('End:  ', end);
console.log(end.format('YYYY-MM-DD HH-mm-ss'));
var yesterdayS = moment().startOf('day').add(-1,'days');
var yesterdayE = moment().endOf('day').add(-1,'days');

var query = {dateUpdate:{$gte:yesterdayS,$lte:yesterdayE}};
/////////////////////////end test query string//////////////////////////////////


//routes
module.exports = function(app){


  app.get('/home/notice', function(req,res,next){
    console.log('enter GET home/notice');
    res.render('notice');
  });


  app.get(['/','/home'], function(req,res,next){
    console.log('enter home');
    if (req.user){ res.render('record_patrol_home',{user: req.user,moment:moment});}
    else{ res.render('record_patrol_home',{user:'',role:'',moment:moment});
    }
  });

  app.get('/about', function(req,res,next){
    res.render('about');
  });
  

  app.get('/record_patrol_my', function(req,res,next){
    console.log('enter GET /record_patrol_my');
    res.render('record_patrol_my',{user:req.user});
  });



  app.get('/record_patrol_menu', function(req,res,next){
    console.log('enter GET /record_patrol_menu');
    res.render('record_patrol_menu',{user:req.user});
  });


  // GET 巡视 （日常 或 安全）
  // app.get('/record_patrol_new', function(req,res,next){
  //   console.log('enter GET /record_patrol_new');
  //   var patrolType = req.query.patrolType;
  //   console.log('patrolType:', patrolType);
  //   res.render('record_patrol_new',{patrolType:patrolType});
  // });


  // POST 巡视 （日常 或 安全）
  app.post('/record_patrol_new', function(req,res,next){
    console.log('enter POST /record_patrol_new');
    form.parse(req, (err,fields,files)=>{                                // start of form.parse
      if (err) {
        console.log('err in parsing form: ', err);
        next(err);
        return;
      }
      var user = req.user.username;
      var id = fields.id;    
      var patrolType = fields.patrolType;
      var record = new db.Record({
        user: user,
        patrolType: patrolType,
      });
      console.log('record:', record);
      record.save(()=>{
        res.render('record_patrol_input',{record:record,moment:moment});
      });
    });                                                                     // end of form.parse
  }); //end of POST


  // 日常 编辑 GET（进一步完善）
  app.get('/record_patrol/:id', function(req,res,next){
    console.log('enter GET /record_patrol/:id');
    var id = req.params.id;
    console.log('id:', id);
    db.Record.findById(id,(err,record)=>{
      res.render('record_patrol', {record:record,moment:moment,user:req.user});
    });
    // res.send('GET record_new_patrol_edit/:id')
  });


  // 日常 编辑 POST（进一步完善）
  app.post('/record_patrol/:id',function(req,res,next){
    console.log('enter POST /record_patrol/:id');
    var id = req.params.id;
    console.log('id:', id);
    form.parse(req, (err,fields,files)=>{              // start of form.parse
      console.log('start parsing form data...');
      if (err) {
        console.log('err in parsing form: ', err);
        next(err);
        return;
      }
      var filesUPloaded = [];
      // var user = req.user.username;
      var zone = fields.zone;
      var text = fields.text;
      var exposure = fields.exposure;
      // var patrolType = 'routine';

      if (Array.isArray(files.file)){    // multiple
        console.log('multiple files');
        files.file.forEach((file, i) => {
          console.log(file.newFilename);
        });
        files.file.forEach((f,i) => {
          filesUPloaded.push(f.newFilename);
        });
      } else if (files.file.size>0){  // one file
        console.log('one file');
        console.log('files.file.newFilename:', files.file.newFilename);
        filesUPloaded.push(files.file.newFilename)
      } else {                        // no file
        console.log('no file');
      }

      console.log('filesUPloaded:', filesUPloaded);
      if (filesUPloaded.length == 0){              // no file
        console.log('no file selected');
        db.Record.findById(id, (err,record)=>{
          record.zone = zone;
          record.text = text;
          record.exposure = exposure;
          record.dateUpdate = Date.now();
          record.save(()=>{
            res.redirect('/record_patrol/'+record.id);
            return;
          });
        });
      }

      // one or more files
      var zone = fields.zone;
      var text = fields.text;
      var exposure = fields.exposure;

      var ctrl = 0;
      console.log('handles files.file: downsize and record...');
      filesUPloaded.forEach((file)=>{                                         // start of forEach
        utils.downsizeImage(`${__dirname}\/..\/upload\/`+file, ()=>{     // start of downsizeImage
          ctrl ++;
          console.log('finished downsize file: ', file);
          console.log('count: ', ctrl);

          if (ctrl == filesUPloaded.length){                                // all files done
            console.log('all files downsize done !!!');
            console.log('filesUPloaded:', filesUPloaded);

            db.Record.findById(id, (err,record)=>{                      // start of update record

              record.zone = zone;
              record.text = text;
              record.exposure = exposure;
              record.dateUpdate = Date.now();
              console.log('record.files:', record.files);
              record.files.push(...filesUPloaded);
              record.save(()=>{
                console.log('saved record:', record);
                res.redirect('/record_patrol/'+record.id);
              });
            });                                                         // end of update record
          }                                                             // end of all files done
        })                                                              // end of downsizeImage
      });                                                               // end of foreach
    });                                                                 // end of form.parse
  });   // end of POST


  // 上传照片 日常 编辑 POST（进一步完善）
  app.post('/record_patrol/id/image_add',function(req,res,next){   //start of POST
    console.log('enter POST /record_patrol/id/image_add===');
    form.parse(req, (err,fields,files)=>{              // start of form.parse
      console.log('start parsing form data...====');
      if (err) {
        console.log('err in parsing form: ', err);
        next(err);
        return;
      }
      console.log('fields:', fields);
      console.log('files:',files);
      var filesUPloaded = [];
      console.log('one file');
      console.log('files.file.newFilename:', files.file.newFilename);
      filesUPloaded.push(files.file.newFilename)
      console.log('filesUPloaded:', filesUPloaded);
      next();
    });        // end of form.parse
  });   // end of POST


  // Start of review 批注
  app.post('/record_patrol/:id/review',function(req,res,next){
    console.log('enter POST /record_patrol/:id');
    var id = req.params.id;
    console.log('id:', id);

    form.parse(req, (err,fields,files)=>{              // start of form.parse
      console.log('start parsing form data...');
      if (err) {
        console.log('err in parsing form: ', err);
        next(err);
        return;
      }
      var status = fields.status;
      var annotation = fields.annotation;
      var exposure = fields.exposure;
      var responsible = fields.responsible;
      // var user = req.user.username;

      db.Record.findById(id, (err,record)=>{
        record.status = status;
        record.annotation = annotation;
        record.exposure = exposure;
        record.responsible = responsible;
        record.dateUpdate = Date.now();
        record.save(()=>{
          res.redirect('/record_patrol/'+record.id);
          return;
        });
      });

    });                                                                 // end of form.parse
  });   // end of POST
  // End of review 批注


  //显示列表，根据过滤条件：patrolType, timeSpan
  // patrolType: all, routine, safety
  // timeSpan: all, 1d
  app.get('/record_patrol_list/:patrolType/:timeSpan', function(req,res,next){
    console.log('enter GET /record_patrol_list/:patrolType/:timeSpan');
    var patrolType = req.params.patrolType;
    var timeSpan = req.params.timeSpan;
    console.log('patrolType, timeSpan:', patrolType, timeSpan);
    // construct query
    var query;
    if (patrolType == 'all'){
      if (timeSpan=='all'){
        query = {partrolType: {$in:['routine','safety']}}
      }else{
        query = {partrolType: {$in:['routine','safety']}}
      }
    }else{
      if (timeSpan == 'all'){
        query = {patrolType: patrolType}
      }else{
        query = {patrolType: patrolType}
      }
    }

    db.Record.find(query, (err, records)=>{
      // console.log('found records:', records);
      res.render('record_patrol_list',{records:records,moment:moment,user:req.user});
    });
  });


  app.get('/record_patrol_full_list', function(req,res,next){
    console.log('enter GET /record_patrol_full_list');
    var query = {date:{$gte:moment(new Date('2022-11-23T08:00:00')).startOf('day')}};  // app version switching on 2022/11/23
    console.log('query:',query);
    console.log('-----------')
    db.Record.find(query, (err,records)=>{
      res.render('record_patrol_full_list', {records:records, moment:moment,user:req.user});
    });
  });


  app.post('/record_patrol/:id/comment_add', function(req,res,next){
    console.log('enter POST /record_patrol/:id/comment_add');
    var id = req.params.id;
    console.log('record id:', id);
    form.parse(req, (err,fields,files)=>{
      if (err) {
        console.log('err in parsing form: ', err);
        next(err);
        return;
      }

      var user = req.user.username;
      var text = fields.text;
      var file;
      if (files.file.originalFilename) {
        file = files.file.newFilename;
        console.log('file selected with newFilename:', file);
      }else{
        console.log('no file selected for uploading.');
        file = "";
      }
      var parents = [id];
      var comment = new db.Comment({
        user: user,
        text:text,
        file:file,
        parents: parents
      });
      console.log('Adding comment:', comment);

      //downsizeImage if needed and then save comment, update record children
      if (file) {
        console.log('file selected for possible downsizing...');
        utils.downsizeImage(`${__dirname}\/..\/upload\/`+file,
            ()=>{
            console.log('file downsized and now saving...');
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
                  console.log('record saved with new child. and record:', record);
                  res.redirect('/record_patrol/'+record.id);
                  // res.render('record_edit',{record:record,moment:moment,user:req.user})
                });
              });
            });
          }
      );
      }else{
        console.log('no file selected for comment');
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
              console.log('record saved with new child.');
              res.redirect('/record_patrol/'+record.id);
              // res.render('record_edit',{record:record,moment:moment,user:req.user})
            });
          });
        });
      }
      //End downsizeImage if needed and then save comment, update record children
    });
  });

  app.get('/record_patrol/:id/comment_remove/:cindex', function(req,res,next){
    console.log('enter GET /record_patrol/:id/comment_remove/:cindex');
    var id = req.params.id;
    var cindex = +req.params.cindex;
    console.log('record.id: ', id);
    console.log('comment.index: ', cindex);
    db.Record.findById(id,(err,record)=>{
      var commentId = record.children[cindex]._id.toString();
      console.log('delete comment  and id: ', record.children[cindex], commentId);
      db.Comment.findById( commentId  , (err,comment)=>{
        // remove file if has
        if (comment.file != ''){
          console.log('file:', comment.file);
          try{ fs.unlinkSync(`${__dirname}\/..\/upload\/`+comment.file);}
          catch(err){console.log('err removing file:',err); }
        }
        // remove db.comment, update record.children
        db.Comment.findByIdAndDelete(commentId,()=>{
          // delete record.children[cindex];
          record.children.splice(cindex,1);
          record.dateUpdate = Date.now();
          console.log('record.children: ', record.children);
          record.save(()=>{   //1
            console.log('one comment removed and record children updated.');
            // res.redirect('/record_patrol/'+id);
            res.send('删除一条评论成功！');
          })
        })
      });
    });
  });


  app.get('/record_patrol_list/:filter', function(req,res,next){
    console.log('##########################################');
    console.log('##########################################');
    console.log('enter GET /record_patrol_list');
    var filter = req.params.filter;
    console.log('filter: ', filter);
    var query = {};
    switch (filter) {
      case 'all':
        query = {}
        break;
      case 'today':
        query = {dateUpdate: {$gte: moment().startOf('day'), $lte: moment().endOf('day')}};
        break;
      case 'yesterday':
        query = {dateUpdate: {$gte:moment().startOf('day').add(-1,'days'), $lte: moment().endOf('day').add(-1,'days')}};
        break;
      case 'routine':
        query = {patrolType: {$in: ['日常','routine']}};
        break;
      case 'safety':
        query = {patrolType: {$in: ['安全','safety']}};
        break;
      case 'followup':
        query = {status: {$in: ['跟进','followup']}};
        break;
      case 'closed':
        query = {status: {$in: ['已关闭','closed']}};
        break;
      case 'my_responsible':
        query = {responsible: req.user.username};
        break;
      case 'my_public':
        query = {user:req.user.username, exposure: 'public'};
        break;
      case 'my_private':
        query = {user: req.user.username, exposure: 'private'};
        break;
      case 'my':
        query = {user: req.user.username};
        break;
      case 'projectManager':
        query = {exposure: 'projectManager'}
        break;
      default:
        query = {};
    }
    if (req.user.role == 'projectManager'){
      console.log('requster is projectManager');
      query.exposure = 'projectManager';
    }
    // use query variable
    console.log('query:', query);
    // find users for 批注选择跟踪负责人选项。
    db.User.find({role:{$in:['supervisor','teamLeader', 'siteManager']}},(err,users)=>{
      db.Record.find(query, (err, records)=>{
        // console.log('found records:', records);
        res.render('record_patrol_list',{records:records,moment:moment,user:req.user,responsibles:users});
      });
    });



  });

  app.get('/record_patrol/:id/file_remove/:filename',function(req,res,next){
    console.log('enter GET /record_patrol/:id/file_remove/:file');
    var id = req.params.id;
    var filename = req.params.filename;
    console.log('id,filename:', id, filename);
    //remove file
    try{
      fs.unlinkSync(`${__dirname}\/..\/upload\/`+filename);
      console.log('original file was removed: ', filename);
      res.send(`${filename} 删除成功！(仅从文件夹中删除)`)
    } catch (err) {
      console.log('err removing file: ', filename);
      res.send(`${filename} 删除未成功！错误:${err}`);
    }
  });

  // remove body image(file) subdocument.
  app.get('/record_patrol/:id/file_doc_remove/:fid',function(req,res,next){
    console.log('enter GET /record_patrol/:id/file_doc_remove/:fid ...');
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
            // delete record.files[index];
            record.markModified('files');
            record.save(()=>{
              console.log('record.saved:');
              res.send(`文件${filename} ${text}已成功删除！`)
            })
      }

    });
  });

  //删除某个批注
  app.get('/record_patrol/:id/:fileId/:reviewId/remove', function(req,res,next){
    console.log('enter GET /record_patrol/:id/:fileId/:reviewId/remove');
    var id = req.params.id;
    var fileId = req.params.fileId;
    var reviewId = req.params.reviewId;
    db.Record.findById(id, (err,record)=>{
      var indexFile = record.files.map(file=>file._id.toString()).indexOf(fileId);
      var indexReview = record.files[indexFile].children.map(review=>review._id.toString()).indexOf(reviewId);
      var reviewText = record.files[indexFile].children[indexReview].text;
      record.files[indexFile].children.splice(indexReview,1);
      record.markModified('files');
      record.save(()=>{
        console.log('record saved.');
        res.send(`已成功删除本批注: ${reviewText}`);
      });
    });
  });


  app.get('/record_patrol/:id/remove',function(req,res,next){
    console.log('enter GET record_patrol/:id/remove');
    var id = req.params.id;
    db.Record.findById(id,(err,record)=>{
      if ( record.children.length > 0 ) {
        console.log('record has comments.');
        res.send('请先删除所有评论再尝试删除记录。');
        next();
      }
      else if ( record.files.length > 0 ) {
        console.log('record has attached files.');
        res.send("请先删除记录中上传的文件，再尝试删除记录。")
        next();
      }
      else {
      console.log('will deleted the record...');
      db.Record.findByIdAndDelete(id,()=>{
        console.log('record deleted');
        // res.send('成功删除一条记录！<br><br><a href="/home">回到首页</a>')
        res.redirect('/record_patrol_list/my_public');
        // res.redirect('/record_patrol/'+id); 
      })
      }
    });
  });




  // 更新记录主体文本
  app.post('/body_text',function(req,res,next){
    console.log('enter POST /body_text');
    form.parse(req, (err,fields,files)=>{
      console.log('fields:',fields);
      var id = fields.id; 
      var patrolType = fields.patrolType;
      var zone = fields.zone;
      var text = fields.text;
      var exposure = fields.exposure;
      var annotation = fields.annotation;
      console.log('id,patroType,zone,text,exposure,annotation:',id,patrolType, zone,text,exposure,annotation);
      if (exposure == undefined) {exposure = 'public';}      
      db.Record.findById(id,(err,record)=>{
        record.patrolType = patrolType;
        record.zone = zone;
        record.text = text;
        record.exposure = exposure;
        record.annotation = annotation;
        record.dateUpdate = Date.now();
        record.save(()=>{
          res.send("提交上述更新成功！")
        });
      });
    });
  });


  //添加记录主体图片 (files)
  app.post('/body_file_plus', function(req,res,next){
    console.log('enter POST /body_file_plus...');
    form.parse(req, (err,fields,files)=>{
      if (err) {console.log('err:',err); next(err); return;}
      var id = fields.id;
      var text = fields.text;
      var file = files.file.newFilename;
      console.log('fields:',fields);
      console.log('files:',files);
      db.Record.findById(fields.id.trim(),(err,record)=>{
        if(err){console.log('err db.Record.findById:',err); return;}
        console.log('record.files:', record.files);
        console.log('files.file.newFilename:', files.file.newFilename);
        var bodyFile = new db.BodyFile({user:req.user.username, text:text, file:file});
        bodyFile.save((err)=>{
          console.log('bodyFile saved.');
          db.Record.findByIdAndUpdate(id, {$push: {"files": bodyFile},$set:{'dateUpdate':Date.now()}}, function(err,record){
            console.log('record updated.');
            res.send(`${files.file.originalFilename}:上传成功！`)
          });
        });
      });
    });
  });


  // ajax for comment image/video plus.
  app.post('/comment_file_plus', function(req,res,next){
    console.log('enter POST /comment_image_plus...');
    form.parse(req,(err,fields,files)=>{
      if (err) {console.log('err parsing form: ', err); next(err); return;}
      var id = fields.id.trim();
      var text = fields.text;
      var file = files.file.newFilename;
      var user = req.user.username;
      var parents = [id];
      console.log('fields:',fields);
      console.log('files:',files); 
      var comment = new db.Comment({text:text,file:file,user:user,parents:parents});
      console.log('new comment: ', comment);
      comment.save(()=>{
        console.log('image comment saved.');
        db.Record.findById(fields.id.trim(), (err,record)=>{
          if (err) {console.log('err db.Record.findById: ', err); next(err); return;}
          record.children.push(comment);
          record.dateUpdate = Date.now();
          console.log('record:', record);
          record.save(()=>{
            console.log('record saved.');
            res.send('图片或视频上传成功！');
          });
        });
      });
    });

  });


  // 添加评论comment
  app.post('/comment_plus', function(req,res,next){
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

  // input: recordId, fileId, text
  // 批注 review: user, text
  app.post('/main_review', function(req,res,next){
    console.log('enter POST /main_review');
    form.parse(req, (err, fields, files)=>{
      var recordId = fields.recordId;
      var fileId = fields.fileId;
      var text = fields.text;
      var responsible = fields.responsible;
      var user = req.user.username;
      var review = new db.Review({user:user, text:text});
      console.log('review:', review);
      db.Record.findById(recordId,(err,record)=>{
        var index = record.files.map(file=>file._id.toString()).indexOf(fileId);
        console.log('index:',index);
        // record.files[index].children.push(review);
        record.dateUpdate = Date.now();
        record.files[index].children.push(review);
        if (responsible) { 
          record.files[index].responsible = responsible;  
          record.status = "跟进";
        }    
                   
        record.markModified('files');
        record.save(()=>{
          console.log('record saved.');
          res.send('添加批注成功！');
        });
      }); 
    });
  });


  // 批注 review for comment
  app.post('/comment_review',function(req,res,next){
    console.log('enter POST /comment_review');
    form.parse(req, (err,fields,files)=>{
      var recordId = fields.recordId;
      var commentId = fields.commentId;
      var text = fields.text;
      var responsible = fields.responsible;
      var user = req.user.username;
      var review = new db.Review({user:user,text:text});
      console.log('review:', review);
      db.Record.findById(recordId, (err, record)=>{
        var index = record.children.map(comment=>comment._id.toString()).indexOf(commentId);
        console.log('index:', index);
        record.children[index].children.push(review);
        if (responsible) { 
          record.children[index].responsible = responsible; 
          record.status = "跟进";
        }
        record.dateUpdate = Date.now();
        record.markModified('children');
        record.save(()=>{
          console.log('record saved.');
          res.send('添加批注成功!');
        })
      });
    });
  });

  // offer review form responsible selection options (user.username)
  app.get('/user_select_options',function(req,res,next){
    console.log('enter GET /test/user_select_options...');
    db.User.find({},{_id:0,username:1},function(err,usernames){
      console.log('usernames:', usernames);
      var options = '<option value="" selected>请选择负责人</option>';
      usernames.forEach(function(username){
        console.log('username:',username);
        options += `<option value="${username['username']}">${username['username']}</option>`;
      });
      console.log('html:',options);
      res.send(options);
    });
  });

  // 关闭该项 （file项）
  app.get('/record_patrol/:id/file_close/:fileId', function(req,res,next){
    console.log('enter GET /record_patrol/:id/file_close/:fileId');
    var id = req.params.id;
    var fileId = req.params.fileId;
    db.Record.findById(id,(err,record)=>{
      var index = record.files.map(file=>file._id.toString()).indexOf(fileId);
      var responsible = record.files[index].responsible;
      record.files[index].status = "已关闭";
      record.markModified('files');
      record.save(()=>{
        console.log('record saved.');
        res.send(`该项已成功关闭(图:${index},跟进负责人${responsible}。)`);
      });
    });

  });


  // 关闭该项 （评论项）
  app.get('/record_patrol/comment_close/:id/:commentId', function(req,res,next){
    console.log('enter GET /record_patrol/:id/comment_close/:commentId');
    var id = req.params.id;
    var commentId = req.params.commentId;
    console.log('id,commentId:', id, commentId);
    db.Record.findById(id,(err,record)=>{
      var index = record.children.map(comment=>comment._id.toString()).indexOf(commentId);
      var responsible = record.children[index].responsible;
      record.children[index].status = "已关闭";
      record.markModified('children');
      record.save(()=>{
        console.log('record saved.');
        res.send(`该项已成功关闭（评论:${index}，跟进负责人${responsible})。`)
      });
    });
  });

  // 更新图片说明
  app.post('/main_FileText',function(req,res,next){
    console.log('enter POST /main_FileText');
    form.parse(req, (err,fields,files)=>{
      var id = fields.recordId;
      var fileId = fields.fileId;
      var text = fields.text;
      console.log('new image text:', text);
      db.Record.findById(id, (err,record)=>{
        var index = record.files.map(file=>file._id.toString()).indexOf(fileId);
        record.files[index].text = text;
        record.dateUpdate = Date.now();
        record.markModified('files');
        record.save(()=>{
          console.log('record saved.');
          res.send(`图片说明已更新为: ${text}！`);
        });
      });
    });
  });


    



};  // end of routes
