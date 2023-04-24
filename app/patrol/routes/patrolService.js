console.log('app/patrol/routes/patrolService.js');

const db = require('../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../../utils');
const u = require('./u.js');


const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/\/..\/\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});



let home = function(req,res,next){
    console.log('home');
    res.render('home');
    console.log('notice sent to client.');
};

let notice = function(req,res,next){
    console.log('notice...');
    res.render('notice');
    console.log('notice sent to client.');
};

let about = function(req,res,next){
    console.log('enter GET /about ...');
    res.render('about');
    console.log('/about sent to client.');
};

let my = function(req,res,next){
    console.log('enter my');
    res.render('my',{user:req.user});
    console.log('res sent to client.');
};

let menu = function(req,res,next){
    console.log('menu');
    res.render('menu',{user:req.user});
    console.log('res sent to client.');
};

let create = function(req,res,next){
    console.log('enter POST /record_patrol_new ...');
    form.parse(req, (err,fields,files)=>{
      if (err) {
        console.log('form.parse err: ', err);
        next(err);
        return;
      }
      let user = req.user.username;
      
      let patrolType = fields.patrolType;
      let project = fields.project;
      let record = new db.Record({
        user: user,
        patrolType: patrolType,
        project: project,
      });
      console.log('record.user:', record.user);
      console.log('record.patrolType:', record.patrolType);
      record.save(()=>{
        res.redirect(301, '/p/show/' + record.id );
        console.log(`record saved with id: 【${record.id}】 `);
      });
    });
};

let show = function(req,res,next){
    console.log('enter GET show/:id');
    let id = req.params.id;
    console.log('id:', id);
    db.Record.findById(id,(err,record)=>{
      res.render('show', {record});
      console.log(`record with id 【${record.id}】sent to client.`);
    });
};

let listFull = function(req,res,next){
    console.log('enter GET /record_patrol_full_list');
    let query = {date:{$gte:moment(new Date('2022-11-23T08:00:00')).startOf('day')}};  // app version switching on 2022/11/23
    db.Record.find(query, (err,records)=>{
      res.render('listFull', {records:records, moment:moment,user:req.user});
      console.log('res sent to client.');
    });
};

let listFilter = function(req,res,next){
    console.log('list ...');
    let filter = req.params.filter;
    console.log('filter: ', filter);
    // let query = {};
    let query = utils.setInitialQuery(req.user);
    console.log('initialQuery:',query);
    query.date = {$gte:moment(new Date('2022-11-23T08:00:00')).startOf('day')}; // from 2022/11/23
    query.exposure = {$ne:"private"};

    query = u.updateQueryWithFilter(query, filter,req);

    console.log('query:', query);
    let q = query;
    let pipeline = {$match:query};
    console.log('pipeline:', pipeline);
    // limit visible inside team


    db.User.find({role:{$in:['supervisor','teamLeader', 'siteManager']}},(err,users)=>{
      if(err){
        console.log('db.user.find err:', err);
      }

      db.Record.find(query, (err, records)=>{
        // u.setPaginationCookies(records,q,res);
        let count = records.length;
        console.log('count:', count);
        let perPage = 20;
        let pages = Math.ceil(count/perPage);
        console.log('pages:', pages);
        res.cookie('pages',pages);
        res.cookie('count', count);
        res.cookie('perPage', perPage);
        res.cookie('q',[q]);
        res.cookie('pipeline',pipeline);
        res.cookie('filter',filter);

        res.render('listFilter',{records:records,responsibles:users,pages:pages,page:1,count:count});
        console.log('records rendered sent to client.');
      });
    });
};

let listFilterPagination = async function(req,res,next){
  console.log('listFilterPagination');
  let page = req.params.p;
  let filter = req.cookies.filter;
  let pages = req.cookies.pages;
  let count = req.cookies.count;
  let query = utils.setInitialQuery(req.user);
  console.log('initialQuery:',query);
  query.date = {$gte:moment(new Date('2022-11-23T08:00:00')).startOf('day')}; // from 2022/11/23
  query.exposure = {$ne:"private"};

  query = u.updateQueryWithFilter(query, filter,req);

  console.log('query:', query);
  let q = query;
  let pipeline = {$match:query};
  console.log('pipeline:', pipeline);
  // limit visible inside team

  let users = await db.User.find({role:{$in:['supervisor','teamLeader', 'siteManager']}});
  // db.User.find({role:{$in:['supervisor','teamLeader', 'siteManager']}},(err,users)=>{
  //   if(err){
  //     console.log('db.user.find err:', err);
  //   }

    records = await db.Record.find(query).skip(20*(page-1)).limit(20);
    res.render('listFilter',{records:records,responsibles:users,pages:pages,page:1,count:count});

    // db.Record.find(query, (err, records)=>{
    //   // u.setPaginationCookies(records,q,res);
    //   let count = records.length;
    //   console.log('count:', count);
    //   let perPage = 20;
    //   let pages = Math.ceil(count/perPage);
    //   console.log('pages:', pages);
    //   res.cookie('pages',pages);
    //   res.cookie('count', count);
    //   res.cookie('perPage', perPage);
    //   res.cookie('q',[q]);
    //   res.cookie('pipeline',pipeline);
    //   res.cookie('filter',filter);

    //   res.render('listFilter',{records:records,responsibles:users,pages:pages,page:1,count:count});
      // console.log('records rendered sent to client.');
    // });
  // });
}


let remove = function(req,res,next) {
  console.log('enter GET record_patrol/:id/remove ...');
  let id = req.params.id;
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
};

let removeFile = function(req,res,next) {
  console.log('enter GET /record_patrol/:id/file_doc_remove/:fid ...');
  let id = req.params.id;
  let fid = req.params.fid;
  db.Record.findById(id, (err,record)=>{
    let index = record.files.map(file=>file._id.toString()).indexOf(fid);
    let filename = record.files[index].file;
    let text = record.files[index].file.text;
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
};

let removeFileReview = function(req,res,next) {
  console.log('enter GET /record_patrol/:id/:fileId/:reviewId/remove');
  let id = req.params.id;
  let fileId = req.params.fileId;
  let reviewId = req.params.reviewId;
  db.Record.findById(id, (err,record)=>{
    let indexFile = record.files.map(file=>file._id.toString()).indexOf(fileId);
    let indexReview = record.files[indexFile].children.map(review=>review._id.toString()).indexOf(reviewId);
    let reviewText = record.files[indexFile].children[indexReview].text;
    record.files[indexFile].children.splice(indexReview,1);
    record.markModified('files');
    record.save(()=>{
      console.log('record saved.');
      res.send(`已成功删除本批注: ${reviewText}`);
    });
  });
};

let updateBodyText = function(req,res,next) {
  console.log('enter POST /body_text');
  form.parse(req, (err,fields,files)=>{
    console.log('fields:',fields);
    let id = fields.id;
    let patrolType = fields.patrolType;
    let zone = fields.zone;
    let profession = fields.profession;
    let text = fields.text;
    let exposure = fields.exposure;
    let annotation = fields.annotation;
    let co = fields.co;
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
      record.save((err,record)=>{
        if(err) { console.log('err:', err)};
        console.log('record:', record);
        res.send("提交上述更新成功！")
        console.log('/body_test update successful.');
      });
    });
  });
};

let addBodyFile = function(req,res,next) {
  console.log('enter POST /body_file_plus...');
  form.parse(req, (err,fields,files)=>{
    if (err) {console.log('err:',err); next(err); return;}
    let id = fields.id;
    let text = fields.text;
    let file = files.file.newFilename;
    console.log('id:', id);
    console.log('text:', text);
    console.log('files.file.newFilename:', files.file.newFilename);

    db.Record.findById(fields.id.trim(),(err,record)=>{
      if(err){console.log('db.Record.findById, err:',err); return;}
      console.log('record.files.length:', record.files.length);
      let bodyFile = new db.BodyFile({user:req.user.username, text:text, file:file});
      bodyFile.save((err)=>{
        console.log('bodyFile saved.');
        db.Record.findByIdAndUpdate(id, {$push: {"files": bodyFile},$set:{'dateUpdate':Date.now()}}, function(err,record){
          console.log('record updated.');
          res.send(`上传成功:【${files.file.newFilename}】！`)
        });
      });
    });
  });
};

let addComment = function(req,res,next) {
  console.log('enter POST /comment_plus ...');
  form.parse(req, (err, fields, files)=>{
    let id = fields.id;
    let text = fields.text;
    let file = files.file.newFilename;
    let user = req.user.username;
    let parents = [id];
    console.log('fields:',fields);
    console.log('files.file.newFilename:',files.file.newFilename);
    console.log('files.file.size:', files.file.size);
    // console.log('files:', files);
    let comment = new db.Comment({text:text, file:file, user:user, parents:parents})
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
};

let addBodyFileReview = function(req,res,next) {
  console.log('enter POST /main_review');
  form.parse(req, (err, fields, files)=>{
    let recordId = fields.recordId;
    let fileId = fields.fileId;
    let text = fields.text;
    let responsible = fields.responsible;
    let user = req.user.username;
    console.log('fields:', fields);
    console.log('user:', user);
    let review = new db.Review({user:user, text:text});
    db.Record.findById(recordId,(err,record)=>{
      let index = record.files.map(file=>file._id.toString()).indexOf(fileId);
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
};

let addCommentReview = function(req,res,next) {
  console.log('enter POST /comment_review');
  form.parse(req, (err,fields,files)=>{
    let recordId = fields.recordId;
    let commentId = fields.commentId;
    let text = fields.text;
    let responsible = fields.responsible;
    let user = req.user.username;
    console.log('fields:', fields);
    let review = new db.Review({user:user,text:text});
    db.Record.findById(recordId, (err, record)=>{
      let index = record.children.map(comment=>comment._id.toString()).indexOf(commentId);
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
};

let getUserSelectOptions = function(req,res,next) {
  console.log('enter GET /test/user_select_options ...');
  db.User.find({selectable:1},{_id:0,username:1},function(err,usernames){
    // console.log('usernames:', usernames);
    let options = '<option value="" selected>请选择负责人</option>';
    usernames.forEach(function(username){
      console.log('username:',username.username);
      // console.log('username.selectable:', username.selectable);
      options += `<option value="${username['username']}">${username['username']}</option>`;
    });
    // console.log('html:',options);
    res.send(options);
    console.log('select options html sent to client.');
  });
};

let closeTrackBodyFile = function(req,res,next) {
  console.log('enter GET /record_patrol/:id/file_close/:fileId');
  let id = req.params.id;
  let fileId = req.params.fileId;
  console.log('id:', id);
  console.log('fileId:', fileId);
  db.Record.findById(id,(err,record)=>{
    let index = record.files.map(file=>file._id.toString()).indexOf(fileId);
    let responsible = record.files[index].responsible;
    record.files[index].status = "已关闭";
    record.markModified('files');
    record.save(()=>{
      console.log('record saved.');
      res.send(`已关闭: 序号【${index}】,跟进负责人为【${responsible}】`);
      console.log(`record.files[${index}].status='已关闭'.`);
    });
  });
};

let closeTrackComment = function(req,res,next) {
  console.log('enter GET /record_patrol/:id/comment_close/:commentId');
  let id = req.params.id;
  let commentId = req.params.commentId;
  console.log('id:', id);
  console.log('commentId:', commentId);
  db.Record.findById(id,(err,record)=>{
    let index = record.children.map(comment=>comment._id.toString()).indexOf(commentId);
    let responsible = record.children[index].responsible;
    record.children[index].status = "已关闭";
    record.markModified('children');
    record.save(()=>{
      console.log('record saved.');
      res.send(`该项已成功关闭：评论【${index}】，跟进负责人【${responsible}】。`)
      console.log(`record.children[${index}].status="已关闭"。`);
    });
  });
};

let updateBodyFileText = function(req,res,next) {
  console.log('enter POST /main_FileText (图片说明) ...');
  form.parse(req, (err,fields,files)=>{
    let id = fields.recordId;
    let fileId = fields.fileId;
    let text = fields.text;
    console.log('fields:', fields);
    db.Record.findById(id, (err,record)=>{
      let index = record.files.map(file=>file._id.toString()).indexOf(fileId);
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
};

let searchGet = function(req,res,next) {
  console.log('enter GET /search ...');
  res.render('search');
};

let searchPost = function(req,res,next) {
  console.log('enter POST /search ...');
  console.log('req.body:', req.body);
  // let start = req.body.start;
  // let end = req.body.end;
  // let exposure = req.body.exposure;
  // let sort = req.body.sort;
  // let patrolType = req.body.patrolType;
  // let status = req.body.status;
  // let text = req.body.text;
  // let queryString = text;
  // let moreText = req.body.moreText;
  let {start,end,exposure,sort,patrolType,status,text,queryString,moreText} = req.body;
  console.log('moreText:', moreText);
  console.log('req.body:', req.body);

  let date = utils.dateSpanObject(start,end);

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

  text = utils.makeTextSearch(text);  //obj text = {$and: andList};
  console.log('text:', JSON.stringify(text));

  let match = {$match: {$and: [date, exposure, user, patrolType, status,text]}}; ///++
  console.log('match:', match);
  console.log('match stringify:', JSON.stringify(match));
  let q = match.$match;
  console.log('q:',q);


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
      // console.log('records:', records);
      // if (!records) {
      //   console.log('no records!');
      //   throw new Error('can not get count.');
      //   return;
      // }
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

      let aggregate = db.Record.aggregate(pipeline);
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
          res.render('list',locals);
        } else {
          console.log("moreText == defined");
          res.render('listTextSearch', locals);
        }
        console.log('records.length:', records.length);
      });

    });
  });

};

let pagination = function(req,res,next) {
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
      res.render('list',{records:records,moment:moment,user:req.user,responsibles:users,pages:pages,page:page,count:count});
      console.log('records rendered sent to client.');
    })


  });
}

let paginationRichText = function(req,res,next) {
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
      res.render('listTextSearch',{records:records,moment:moment,user:req.user,responsibles:users,pages:pages,page:page,queryString:queryString,count:count});
      console.log('records rendered sent to client.');
    })


  });
};




module.exports = exports = {
    home,
    notice,
    about,
    my,
    menu,
    create,
    show,
    listFull,
    listFilter,
    listFilterPagination,
    remove,
    removeFile,
    removeFileReview,
    updateBodyText,
    addBodyFile,
    addComment,
    addBodyFileReview,
    addCommentReview,
    getUserSelectOptions,
    closeTrackBodyFile,
    closeTrackComment,
    updateBodyFileText,
    searchGet,
    searchPost,
    pagination,
    paginationRichText,
}
