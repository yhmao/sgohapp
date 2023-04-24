console.log('/route/patrol.js');

var db = require('../database');
var fs = require('fs');
var moment = require('moment');
const formidable = require('formidable');
var path = require('path');
var utils = require('../utils');
var fs = require('fs');

const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){   
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});



module.exports = function(app){

// get 公告
app.get('/home/notice', function(req,res,next){
  console.log('enter GET home/notice...');
  res.render('notice');
  console.log('notice sent to client.');
});

// get home page
app.get(['/','/home'], function(req,res,next){
  console.log('enter / or /home...');
  if (req.user){ 
    console.log('req.user.name:', req.user.username);
    res.render('record_patrol_home',{user: req.user,moment:moment});
  }
  else{ 
    console.log('req.user (==undefined) :', req.user);
    res.render('record_patrol_home',{user:'',role:'',moment:moment});
  }
  console.log('record_patrol_home.ejs sent to client.');
});

// get about 关于
app.get('/about', function(req,res,next){
  console.log('enter GET /about ...');
  res.render('about');
  console.log('/about sent to client.');
});

// get menu “我的”
app.get('/record_patrol_my', function(req,res,next){
  console.log('enter GET /record_patrol_my');
  res.render('record_patrol_my',{user:req.user});
  console.log('res sent to client.');
});

// get menu list filters
app.get('/record_patrol_menu', function(req,res,next){
  console.log('enter GET /record_patrol_menu');
  res.render('record_patrol_menu',{user:req.user});
  console.log('res sent to client.');
});

// create record, => record.user/patrolType
app.post('/record_patrol_new', function(req,res,next){
  console.log('enter POST /record_patrol_new ...');
  form.parse(req, (err,fields,files)=>{ 
    if (err) {
      console.log('form.parse err: ', err);
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
    console.log('record.user:', record.user);
    console.log('record.patrolType:', record.patrolType);
    record.save(()=>{
      res.render('record_patrol_input',{record:record,moment:moment,user:req.user});
      console.log(`record saved with id: 【${record.id}】 `);
    });    
  }); 
});   

// get record by id (for show/edit )
app.get('/record_patrol/:id', function(req,res,next){
  console.log('enter GET /record_patrol/:id');
  var id = req.params.id;
  console.log('id:', id);
  db.Record.findById(id,(err,record)=>{
    res.render('record_patrol', {record:record,moment:moment,user:req.user});
    console.log(`record with id 【${record.id}】sent to client.`);
  });
});


// remove comment : record.children[x], db.Comment
app.get('/record_patrol/:id/comment_remove/:cindex', function(req,res,next){
  console.log('enter GET /record_patrol/:id/comment_remove/:cindex');
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
          console.log(`fs.unlinkSync: ${comment.file}` );
        }
        catch(err){console.log('fs.unlinkSync err:',err); }
      }
      db.Comment.findByIdAndDelete(commentId,()=>{
        console.log(`db.Comment id【${commentId}】deleted.`);
        record.children.splice(cindex,1);
        record.dateUpdate = Date.now();
        record.save(()=>{ 
          console.log(`removed record.children[${cindex}]`);
          res.send('删除一条评论成功！');
          console.log('res sent to client.');
        });
      });
    });
  });
});

// record list, for 袁总批注
app.get('/record_patrol_full_list', function(req,res,next){
  console.log('enter GET /record_patrol_full_list');
  var query = {date:{$gte:moment(new Date('2022-11-23T08:00:00')).startOf('day')}};  // app version switching on 2022/11/23
  db.Record.find(query, (err,records)=>{
    res.render('record_patrol_full_list', {records:records, moment:moment,user:req.user});
    console.log('res sent to client.');
  });
});

// get records based on filter(string)
app.get('/record_patrol_list/:filter', function(req,res,next){
  console.log('enter GET /record_patrol_list/:filter ...');
  var filter = req.params.filter;
  console.log('filter: ', filter);
  var query = {};
  query.date = {$gte:moment(new Date('2022-11-23T08:00:00')).startOf('day')}; // from 2022/11/23
  query.exposure = {$ne:"private"};
  switch (filter) {
    case 'all':
      break;
    case 'today':
      query.dateUpdate = {$gte: moment().startOf('day'), $lte: moment().endOf('day')};
      break;
    case 'yesterday':
      query.dateUpdate = {$gte:moment().startOf('day').add(-1,'days'), $lte: moment().endOf('day').add(-1,'days')};
      break;
    case 'routine':
      query.patrolType = {$in: ['日常','routine']};
      break;
    case 'safety':
    query.patrolType = {$in: ['安全','safety']};
      break;
    case 'followup':
      query.status =  {$in: ['跟进','followup']};
      break;
    case 'closed':
      query.status =  {$in: ['已关闭','closed']};
      break;
    case 'my_responsible':
      query.responsible = req.user.username;
      break;
    case 'my_public':
      query.user = req.user.username;
      query.exposure = {$ne:"private"};
      break;
    case 'my_private':
      query.user = req.user.username;
      query.exposure = 'private';
      break;
    case 'my':
      query.user = req.user.username;
      delete query.exposure;
      break;
    case 'projectManager':
      query.exposure = 'projectManager';
      break;
    default:
      // query = {};
  }
  if (req.user.role == 'projectManager'){
    console.log('req.user.role == projectManager');
    query.exposure = 'projectManager';
  }

  console.log('query:', query);
  var q = query;
  var pipeline = {$match:query};
  console.log('pipeline:', pipeline);
  // limit visible inside team
  db.User.find({role:{$in:['supervisor','teamLeader', 'siteManager']}},(err,users)=>{
    if(err){
      console.log('db.user.find err:', err);      
    }

    db.Record.find(query, (err, records)=>{

      let count = records.length;
      console.log('count:', count);
      let perPage = 20;
      let pages = Math.ceil(count/perPage);
      console.log('pages:', pages);
      res.cookie('pages',pages);
      res.cookie('count', count);
      res.cookie('perPage', perPage);
      res.cookie('q',q);

      res.render('record_patrol_list',{records:records,moment:moment,user:req.user,responsibles:users,pages:pages,page:1,count:count});
      console.log('records rendered sent to client.');
    });
  });



});



// remove record.files[x].file
app.get('/record_patrol/:id/file_remove/:filename',function(req,res,next){
  console.log('enter GET /record_patrol/:id/file_remove/:file ...');
  var id = req.params.id;
  var filename = req.params.filename;
  console.log('id:', id);
  console.log('filename:',filename);
  try{
    fs.unlinkSync(`${__dirname}\/..\/upload\/`+filename);
    console.log('fs.unlinkSync: ', filename);
    res.send(`${filename} 删除成功！(仅从文件夹中删除)`)
  } catch (err) {
    console.log(`fs.unlinkSync ${filename} err: ${err}`);
    res.send(`${filename} 删除未成功！错误:${err}`);
  }
  console.log('res sent to client.');
});

// remove record.files[x] (when !record.files[x].children)
app.get('/record_patrol/:id/file_doc_remove/:fid',function(req,res,next){
  console.log('enter GET /record_patrol/:id/file_doc_remove/:fid ...');
  var id = req.params.id;
  var fid = req.params.fid;
  db.Record.findById(id, (err,record)=>{
    var index = record.files.map(file=>file._id.toString()).indexOf(fid);
    var filename = record.files[index].file;
    var text = record.files[index].file.text;
    console.log('index:',index);
    if (record.files[index].children.length > 0 ) { 
      res.send('本项有批注，不能删除！'); 
      console.log(`record.files[${index}].children, rejected.`);
      return;
    }
    else {
          try{fs.unlinkSync(`${__dirname}\/..\/upload\/${record.files[index].file}`);}
          catch(err){console.log('err removing file:', err);}      
          record.files.splice(index,1);
          record.markModified('files');
          record.save(()=>{
            console.log(`record.files[${index}] removed. record saved.`);
            res.send(`附件[${index}]【${filename}】 ${text}已成功删除！`);
            console.log('res sent to client.');
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

// record remove (when !record.children && !record.files)
app.get('/record_patrol/:id/remove',function(req,res,next){
  console.log('enter GET record_patrol/:id/remove ...');
  var id = req.params.id;
  db.Record.findById(id,(err,record)=>{
    if ( record.children.length > 0 ) {
      console.log('record.children, rejected.');
      res.send('请先删除所有评论再尝试删除记录。');
      next();
    }
    else if ( record.files.length > 0 ) {
      console.log('record.files, rejected');
      res.send("请先删除记录中上传的文件，再尝试删除记录。")
      next();
    }
    else {
    db.Record.findByIdAndDelete(id,()=>{
      console.log('record removed.');
      res.redirect('/record_patrol_list/my_public');
      console.log('res sent to client for redirect.');
    })
    }
  });
});

// Update body text => record.patrolType/zone/text/exposure/annotation
app.post('/body_text',function(req,res,next){
  console.log('enter POST /body_text');
  form.parse(req, (err,fields,files)=>{
    console.log('fields:',fields);
    var id = fields.id; 
    var patrolType = fields.patrolType;
    var zone = fields.zone;
    var profession = fields.profession;
    var text = fields.text;
    var exposure = fields.exposure;
    var annotation = fields.annotation;
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
        res.send("提交上述更新成功！")
        console.log('/body_test update successful.');
      });
    });
  });
});

// Add file => record.files
app.post('/body_file_plus', function(req,res,next){
  console.log('enter POST /body_file_plus...');
  form.parse(req, (err,fields,files)=>{
    if (err) {console.log('err:',err); next(err); return;}
    var id = fields.id;
    var text = fields.text;
    var file = files.file.newFilename;
    console.log('id:', id);
    console.log('text:', text);
    console.log('files.file.newFilename:', files.file.newFilename);

    db.Record.findById(fields.id.trim(),(err,record)=>{
      if(err){console.log('db.Record.findById, err:',err); return;}
      console.log('record.files.length:', record.files.length);
      var bodyFile = new db.BodyFile({user:req.user.username, text:text, file:file});
      bodyFile.save((err)=>{
        console.log('bodyFile saved.');
        db.Record.findByIdAndUpdate(id, {$push: {"files": bodyFile},$set:{'dateUpdate':Date.now()}}, function(err,record){
          console.log('record updated.');
          res.send(`上传成功:【${files.file.newFilename}】！`)
        });
      });
    });
  });
});

// Add comment => record.children
app.post('/comment_plus', function(req,res,next){
  console.log('enter POST /comment_plus ...');
  form.parse(req, (err, fields, files)=>{
    var id = fields.id;
    var text = fields.text;
    var file = files.file.newFilename;
    var user = req.user.username;
    var parents = [id];
    console.log('fields:',fields);
    console.log('files.file.newFilename:',files.file.newFilename);
    console.log('files.file.size:', files.file.size);
    // console.log('files:', files);
    var comment = new db.Comment({text:text, file:file, user:user, parents:parents})
    // console.log('new comment:', comment);
    comment.save(()=>{
      console.log('comment saved.');
      db.Record.findById(id, (err,record)=>{
        if (err) {console.log('db.Record.findById err: ', err); next(err); return;}
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

// 批注 record.files[x].children, record.status
app.post('/main_review', function(req,res,next){
  console.log('enter POST /main_review');
  form.parse(req, (err, fields, files)=>{
    var recordId = fields.recordId;
    var fileId = fields.fileId;
    var text = fields.text;
    var responsible = fields.responsible;
    var user = req.user.username;
    console.log('fields:', fields);
    console.log('user:', user);
    var review = new db.Review({user:user, text:text});
    db.Record.findById(recordId,(err,record)=>{
      var index = record.files.map(file=>file._id.toString()).indexOf(fileId); 
      console.log(`record.files[${index}].children.push`)
      record.dateUpdate = Date.now();
      record.files[index].children.push(review);
      if (responsible) { 
        record.files[index].responsible = responsible;  
        record.status = "跟进";
      }                   
      record.markModified('files');
      record.save(()=>{
        console.log('record saved.');
        res.send(`添加批注【${text}】成功！`);
        console.log('res sent to client.');
      });
    }); 
  });
});

// 批注（针对评论）text,responsible => record.childen[x].children[0], record.children[x].responsible
app.post('/comment_review',function(req,res,next){
  console.log('enter POST /comment_review');
  form.parse(req, (err,fields,files)=>{
    var recordId = fields.recordId;
    var commentId = fields.commentId;
    var text = fields.text;
    var responsible = fields.responsible;
    var user = req.user.username;
    console.log('fields:', fields);
    var review = new db.Review({user:user,text:text});  
    db.Record.findById(recordId, (err, record)=>{
      var index = record.children.map(comment=>comment._id.toString()).indexOf(commentId);
      console.log(`record.children[${index}]`);
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
        console.log(`record.children[${index}].children[0] = review`);
      })
    });
  });
});

// get 批注负责人 options  (html)
app.get('/user_select_options',function(req,res,next){
  console.log('enter GET /test/user_select_options ...');
  db.User.find({selectable:1},{_id:0,username:1},function(err,usernames){
    // console.log('usernames:', usernames);
    var options = '<option value="" selected>请选择负责人</option>';
    usernames.forEach(function(username){
      console.log('username:',username.username);
      // console.log('username.selectable:', username.selectable);
      options += `<option value="${username['username']}">${username['username']}</option>`;
    });
    // console.log('html:',options);
    res.send(options);
    console.log('select options html sent to client.');
  });
});

// 批注关闭该项 record.files[x].status = '已关闭'
app.get('/record_patrol/:id/file_close/:fileId', function(req,res,next){
  console.log('enter GET /record_patrol/:id/file_close/:fileId');
  var id = req.params.id;
  var fileId = req.params.fileId;
  console.log('id:', id);
  console.log('fileId:', fileId);
  db.Record.findById(id,(err,record)=>{
    var index = record.files.map(file=>file._id.toString()).indexOf(fileId);
    var responsible = record.files[index].responsible;
    record.files[index].status = "已关闭";
    record.markModified('files');
    record.save(()=>{
      console.log('record saved.');
      res.send(`已关闭: 序号【${index}】,跟进负责人为【${responsible}】`);
      console.log(`record.files[${index}].status='已关闭'.`);
    });
  });
});

// 批注关闭评论项  record.children[x].status = "已关闭"
app.get('/record_patrol/comment_close/:id/:commentId', function(req,res,next){
  console.log('enter GET /record_patrol/:id/comment_close/:commentId');
  var id = req.params.id;
  var commentId = req.params.commentId;
  console.log('id:', id);
  console.log('commentId:', commentId);
  db.Record.findById(id,(err,record)=>{
    var index = record.children.map(comment=>comment._id.toString()).indexOf(commentId);
    var responsible = record.children[index].responsible;
    record.children[index].status = "已关闭";
    record.markModified('children');
    record.save(()=>{
      console.log('record saved.');
      res.send(`该项已成功关闭：评论【${index}】，跟进负责人【${responsible}】。`)
      console.log(`record.children[${index}].status="已关闭"。`);
    });
  });
});

// Update file text => record.files[x].text
app.post('/main_FileText',function(req,res,next){
  console.log('enter POST /main_FileText (图片说明) ...');
  form.parse(req, (err,fields,files)=>{
    var id = fields.recordId;
    var fileId = fields.fileId;
    var text = fields.text;
    console.log('fields:', fields);
    db.Record.findById(id, (err,record)=>{
      var index = record.files.map(file=>file._id.toString()).indexOf(fileId);
      console.log(`record.files[${index}].text=${text}.`)
      record.files[index].text = text;
      record.dateUpdate = Date.now();
      record.markModified('files');
      record.save((err,record)=>{
        console.log('record saved.');
        res.send(`图片说明 record.files[${index}].text 已更新为: ${record.files[index].text}！`);
      });
    });
  });
});


/* Andvanced search form */
app.get('/search', function(req,res,next){
  console.log('enter GET /search ...');  
  res.render('search');
});


/* Advance search:
- start and end date
- my public or private or both
- patrolType: routine or safe or all
- status: follow or closed,...
- text search
Using pipeline, return only first 20 results
while store context to cookie:
- count (total)
- pages
- perPage
- q ($match == {$match: {$and: [date, patrolType, status,text]}} )
- sort ( {'date':-1} )
- queryString
Rendering res:
- list 
- list rich text (moreText checked)
*/
app.post('/search', function(req,res,next){
  console.log('enter POST /search ...');
  console.log('req.body:', req.body);
  let start = req.body.start;
  let end = req.body.end;
  let exposure = req.body.exposure;
  let sort = req.body.sort;
  let patrolType = req.body.patrolType;
  let status = req.body.status;
  let text = req.body.text;
  let queryString = text;
  let moreText = req.body.moreText;
  console.log('moreText:', moreText);
  console.log('req.body:', req.body);

  date = utils.dateSpanObject(start,end);

  console.log('req.user:', req.user);

  let user = {};
  switch(exposure) {
    case "exposureMyPrivate": exposure = {exposure:'private'}; user = {user: req.user.username}; break;
    case "exposureMyPublic": exposure = {exposure:'public'}; user = {user: req.user.username}; break;
    case "exposureMyAll": exposure = {}; user = {user: req.user.username}; break;
    case "exposureAll": exposure = {};break;
    default: exposure = {}; user = {}; break;
  }

  if ( sort == '' || sort == 'date') { 
    sort = {$sort:{'date':-1}};
    date = {'date': date};
  } else {
    sort = {$sort: {'dateUpdate':-1}};
    date = {'dateUpdate': date};
  }
  console.log('sort:', sort);
  console.log('date:', date);
  
  if ( patrolType == '' ) { patrolType = {}; }
  else { patrolType = { patrolType: patrolType }; }
  console.log('patrolType:', patrolType);

  if (status == '') { status= {};}
  else { status = { status: status}; }  
  console.log('status:', status);

  text = utils.makeTextSearch(text);  //obj
  console.log('text:', JSON.stringify(text));

  let match = {$match: {$and: [date, exposure, user, patrolType, status,text]}}; ///++
  console.log('match:', match);
  console.log('match stringify:', JSON.stringify(match));
  let q = match;


  let skip = {$skip: 0}; 
  console.log('skip:', skip);

  let limit = {$limit: 20};
  console.log('limit:',limit);

  let pipeline = [match, sort,skip, limit];
  console.log('pipeline:', pipeline);

  // limit visible inside team
  db.User.find({role:{$in:['supervisor','teamLeader', 'siteManager']}},(err,users)=>{
    if(err){
      console.log('db.user.find err:', err);      
    }

    db.Record.aggregate([match,{$count:'count'}], (err, records)=>{
      let count = records[0].count;  // records: [ { count: 79 } ]
      console.log('count:', count);
      let pages = Math.ceil(count/20);
      console.log('pages:', pages);

      res
        .cookie('pages',pages)
        .cookie('count', count)
        .cookie('q',q)
        .cookie('sort',sort.$sort)
        .cookie('queryString',queryString)
        .cookie('pipeline', pipeline)
        .cookie('start', start,{maxAge: 1000 * 60 * 60 * 24 * 30})
        .cookie('end',end,{maxAge: 1000 * 60 * 60 * 24 * 30})

      var aggregate = db.Record.aggregate(pipeline);
      aggregate.exec(function(err,records){
        console.log('moreText:',moreText);
        let locals = {
          records:records,
          moment:moment,
          user:req.user,
          responsibles:users,
          pages:pages,
          page:1,
          count:count,
          queryString:queryString
        };

        if (moreText == undefined) {
          console.log("moreText == undefined");
          res.render('record_patrol_list',locals);      
        } else {
          console.log("moreText == defined");
          res.render('record_patrol_list_text_search', locals);
        }
        console.log('records.length:', records.length);
      });

    });
  });

});


/* Pagination (list of title only)
From req.cookies:
- q (match)
- pages
- sort ({'dateUpdate':-1})
From req.params:
- page
*/
app.get('/record_patrol_list/q/:page', function(req,res,next){
  console.log('enter GET /record_patrol_list/q/:page ...');
  let q = req.cookies.q;
  console.log('q:', q);
  console.log('typeof q:', typeof q);
  console.log('q stringify:', JSON.stringify(q));

  // date string => Date object
  if(q.$match.$and[0].dateUpdate){
    console.log('dateUpdate');
    q.$match.$and[0].dateUpdate.$gte = new Date(q.$match.$and[0].dateUpdate.$gte);
    q.$match.$and[0].dateUpdate.$lte = new Date(q.$match.$and[0].dateUpdate.$lte);
  } else if (q.$match.$and[0].date)
  {
    console.log('date');
    q.$match.$and[0].date.$gte = new Date(q.$match.$and[0].date.$gte);
    q.$match.$and[0].date.$lte = new Date(q.$match.$and[0].date.$lte);
  } else {
    console.log('match object without date or dateUpdate!!!!');
  }


  let pages = req.cookies.pages;
  console.log('pages:', pages);
  let page = req.params.page;
  let sort = req.cookies.sort;
  console.log('sort:', sort);
  console.log('page:', page);
  let count = req.cookies.count;
  console.log('count:', count);

  if (sort == undefined) {
    console.log('sort == undefined');
    sort = {'dateUpdate':-1};
  }
  let skip = (page-1)*20;
  let limit = 20;

  let pipeline = [q,{$sort:sort},{$skip:skip},{$limit:limit}];
  console.log('pipeline:', pipeline);

  db.User.find({role:{$in:['supervisor','teamLeader', 'siteManager']}},(err,users)=>{
    if(err){
      console.log('db.user.find err:', err);      
    }

    db.Record.aggregate([q]).exec(function(err,records){
      console.log('records.length:', records.length);
    })

    db.Record.aggregate(pipeline).exec(function(err,records){
      res.render('record_patrol_list',{records:records,moment:moment,user:req.user,responsibles:users,pages:pages,page:page,count:count});
      console.log('records rendered sent to client.');
    })


  });
});

/* Pagination (list richtext)
From req.cookies:
- q (match) 
- pages
- sort ({'dateUpdate':-1})
- queryString
- count
From req.params:
- page
*/
app.get('/record_patrol_list/q/text/:page', function(req,res,next){
  console.log('enter GET /record_patrol_list/q/:page ...');
  let q = req.cookies.q;
  console.log('q:', q);
  console.log('q.stringify:', JSON.stringify(q));

  // date string => Date object
  if(q.$match.$and[0].dateUpdate){
    console.log('dateUpdate');
    q.$match.$and[0].dateUpdate.$gte = new Date(q.$match.$and[0].dateUpdate.$gte);
    q.$match.$and[0].dateUpdate.$lte = new Date(q.$match.$and[0].dateUpdate.$lte);
  } else if (q.$match.$and[0].date)
  {
    console.log('date');
    q.$match.$and[0].date.$gte = new Date(q.$match.$and[0].date.$gte);
    q.$match.$and[0].date.$lte = new Date(q.$match.$and[0].date.$lte);
  } else {
    console.log('match object without date or dateUpdate!!!!');
  }


  let pages = req.cookies.pages;
  console.log('pages:', pages);
  let sort = req.cookies.sort;
  console.log('sort:', sort);
  let queryString = req.cookies.queryString;
  let count = req.cookies.count;
  console.log('count:', count);

  let page = req.params.page;
  console.log('page:', page);

  if (sort == undefined) {
    console.log('sort == undefined');
    sort = {'dateUpdate':-1};
  }
  let skip = (page-1)*20;
  let limit = 20;

  let pipeline = [q,{$sort:sort},{$skip:skip},{$limit:limit}];
  console.log('pipeline:', pipeline);

  db.User.find({role:{$in:['supervisor','teamLeader', 'siteManager']}},(err,users)=>{
    if(err){
      console.log('db.user.find err:', err);      
    }

    db.Record.aggregate([q]).exec(function(err,records){
      console.log('records.length:', records.length);
    })

    db.Record.aggregate(pipeline).exec(function(err,records){
      res.render('record_patrol_list_text_search',{records:records,moment:moment,user:req.user,responsibles:users,pages:pages,page:page,queryString:queryString,count:count});
      console.log('records rendered sent to client.');
    })


  });
});


  



};  // end of routes
