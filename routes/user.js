var db = require('../database');
var fs = require('fs');
var moment = require('moment');
// var passport = require('../middlewares').passport;
console.log('user.js.');

// upload
var multer = require('multer');
const formidable = require('formidable');
var path = require('path');
var utils = require('../utils');
var fs = require('fs');

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

//routes
module.exports = function(app){

  app.get('/home/notice', function(req,res,next){
    console.log('enter GET home/notice');
    res.render('notice');
  });

  app.get(['/','/home'], function(req,res,next){
    console.log('enter home');
    console.log('req.session: ', req.session);
    console.log('req.user:', req.user);
    // console.log('user:', locals.user);
    if (req.user){console.log('req.user.username:', req.user.username);}

    if (req.user){ res.render('home',{user: req.user});}
    else{ res.render('home',{user:'',role:''});
    }
  });

  app.get('/record_new',function(req,res,next){
    console.log('enter get record_new.');
    db.Zone.find({},(err,zones)=>{
      if(err){
        console.log('err in finding zones:', err);
        zones = [];
      }
      console.log('find zones:',zones);
      res.render('record_new',{zones:zones})
    });
  });

  app.post('/record_new', function(req,res,next){
    console.log('enter post record_new');

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
    // form.once('error', console.error);
    // form.on('fileBegin',(formname,file)=>{
    //   console.log('fileBegin formname&file:', formname,file);
    //   form.emit('data', {name:'fileBegin', formname, value:file});
    // });
    // form.on('file', (formname,file)=>{
    //   console.log('file  formname & file: ', formname, file);
    //   form.emit('data',{name:'file',formname, value:file});
    // });
    // form.on('field', (fieldName,fieldValue)=>{
    //   console.log('field  key & value: ', fieldName,fieldValue);
    //   form.emit('data',{name:'field', key:fieldName, value:fieldValue});
    // });
    // form.once('end', ()=>{
    //   console.log('end');
    // });
    form.parse(req, (err,fields,files)=>{
      console.log('start parsing form...');
      if (err) {
        console.log('err in parsing form using formidable: ', err);
        next(err);
        return;
      }
      // console.log('files.file:', files.file);

      var user = req.user.username;
      console.log('fields:', fields);
      var project = fields.project;
      var profession = fields.profession;
      console.log('profession:', profession);
      console.log('type of profession:', typeof profession);
      var zone = fields.zone;
      console.log('zone:',zone);
      var title = fields.title;
      console.log('title: ', title);
      var text = fields.text;
      console.log('text:', text);
      var caption = fields.caption;
      var exposure = fields.exposure;
      console.log('exposure:', exposure);
      var file;
      if(files.file.originalFilename){
        file = files.file.newFilename;
        console.log('file selected with newFilename:', file);
      }else{
        console.log('no file selected for uploading.');
        file = '';
      }

      var record = new db.Record({
        user:user,
        project:project,
        profession:profession,
        zone: zone,
        title: title,
        text:text,
        caption:caption,
        exposure:exposure,
        file:file
      });


      //downsizeImage if needed
      console.log('file: ', file);

      if (file){
        console.log('has file possible to downsize...');
        utils.downsizeImage(`${__dirname}\/..\/upload\/`+file, ()=>{
          console.log('after downsize...');
          record.save(()=>{
            console.log('one record saved.');
            console.log('record just saved: ', record);
            // res.send('response from post record_new....');
            db.Zone.find({},(err,zones)=>{
              res.render('record_edit', {record:record,comments:record.children,zones:zones,moment:moment})
            });
          });
        });
      }else{
        console.log('no file chosen to downsize...');
        console.log('just save without file...');
        record.save(()=>{
          console.log('one record saved.');
          console.log('record just saved: ', record);
          // res.send('response from post record_new....');
          db.Zone.find({},(err,zones)=>{
            res.render('record_edit', {record:record,comments:record.children,zones:zones,moment:moment})
          });
        });
      }

    })
  });

  app.get('/record_edit/:id', function(req,res,next){
    console.log('enter get record_edit');
    var id = req.params.id;
    console.log('id:',id);
    db.Record.findById(id,
      function(err, record){
      console.log('found record:', record);
      //get comments
      var comments = [];
      // var record = await db.Record.findById(id)
      var commentIds = record.children;
      console.log('commentIds:', commentIds);
      if (commentIds.length > 0){
        console.log('has comments');
        var ctrl = 0;
        commentIds.forEach((id, i) => {
          console.log('id:',id);
          console.log('i:', i);
          db.Comment.findById(id,function(err,comment){
            console.log('comment id: ', );
            console.log('comment:', comment.id);
            comments.push(comment);
            ctrl++;
            if (ctrl === commentIds.length){
              console.log('all comments:', comments);
              //render with comments
              db.Zone.find({},(err,zones)=>{
                res.render('record_edit',{record:record,comments:comments,zones:zones,moment:moment,user:req.user});
              });
            }
          });
        });
      }else{
        console.log('no comments');
        //render without comments
        db.Zone.find({},(err,zones)=>{
          res.render('record_edit',{record:record,comments:[],zones:zones,moment:moment,user:req.user});
        });
      }
    });
  });


  app.post('/record_edit/:id',  async function(req,res,next){
    console.log('enter post record_edit');
    const form = formidable({
      multiples:true,
      uploadDir: `${__dirname}\/..\/upload`,
      keepExtensions:true,
      maxFileSize:50*1024*1024,
      filename: function (name, ext, part, form){
        console.log('during form setup, name,ext :', name,ext );
        if(name=='invalid-name'){return "";}
        return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
      }
    });
    // form.once('error', console.error);
    // form.on('fileBegin',(formname,file)=>{
    //   console.log('fileBegin formname&file:', formname,file);
    //   form.emit('data', {name:'fileBegin', formname, value:file});
    // });
    // form.on('file', (formname,file)=>{
    //   console.log('file  formname & file: ', formname, file);
    //   form.emit('data',{name:'file',formname, value:file});
    // });
    // form.on('field', (fieldName,fieldValue)=>{
    //   console.log('field  key & value: ', fieldName,fieldValue);
    //   form.emit('data',{name:'field', key:fieldName, value:fieldValue});
    // });
    form.parse(req,(err,fields,files)=>{
      if (err) {
        console.log('err in parsing from using formidable: ',err);
        next(err);
        return;
      }
      // console.log('fields: ',fields);
      // console.log('files: ', files);
      var id = fields.id;
      console.log('id:',id);
      var user = req.user.username;
      console.log('user:', user);
      var project = fields.project;
      var profession = fields.profession;
      var zone = fields.zone;
      var title = fields.title;
      var text = fields.text;
      var caption = fields.caption;
      var filename = fields.filename;
      var exposure = fields.exposure;
      // console.log('files.file: ', files.file);
      var file;
      if (files.file.originalFilename){
        console.log('you uploaded a file.');
        file = files.file.newFilename;
        console.log('and your uploaded file is: ', file);
        console.log('while original file is: ', filename);
      }else{
        console.log('no file was uploaded.');
        file = '';
      }
      db.Record.findById(id, (err,record)=>{
        if(err){
          console.log('err in finding record by id: ', err);
          next(err);
          return;
        }
        console.log('find record by id from db: ', record);
        record.project = project;
        record.profession = profession;
        record.zone = zone;
        record.title = title;
        record.text = text;
        record.caption = caption;
        record.exposure = exposure;
        record.dateUpdate = Date.now();
        if(file){
          record.file = file;
          //delete original file if replaced
          try {
            fs.unlinkSync(`${__dirname}\/..\/upload\/`+filename)
            console.log('original file was removed: ', filename);
          }catch (e){
            console.log('err removing file which is not successful: ', filename);
          }
        }
        //downsizeImage if needed
        console.log('file: ', file);
        utils.downsizeImage(`${__dirname}\/..\/upload\/`+file, ()=>{
          console.log('saving record: ', record);
          record.save(()=>{
            db.Record.findById(id,(err,record)=>{
              if(err){
                console.log('err finding record by id from db:', err);
                next(err);
                return;
              }
              console.log('updated record fetched from db: ', record);
              db.Zone.find({}, (err,zones)=>{
                res.render('record_edit',{
                  record:record,
                  comments:record.children,
                  zones:zones,
                  moment:moment
                });
              });
            });
          });
        });
      });
    });
  });

  app.get('/record_show_all', function(req,res,next){
    db.Record.find({exposure:{$ne : "private"}}, function(err,records){
      console.log('records:',records);
      res.render('record_show_all', {records:records,moment:moment});
    })
  });


  app.get('/my/record_show_all', function(req,res,next){
    console.log('enter my/record_show_all');
    db.Record.find({user:req.user.username},function(err,records){
      console.log('my records: ', records);
      res.render('record_show_all', {records:records,moment:moment})
    })
  });


  app.get('/my/record_show_all_c', function(req,res,next){
    console.log('enter GET my/record_show_all_c');
    var myComments = [];

    db.Comment.find({user:req.user.username},function(err,comments){
      console.log('find all my comments:');
      var ctrl = 0;
      comments.forEach((comment, i) => {
        console.log('comment id: ', comment.id, comment.text);
        // console.log('parents[0].id: ', comment.parents[0]);
        var myComment = comment;
        db.Record.findById(comment.parents[0],(err,record)=>{
          // console.log('parent[0]:', record);
          myComment.parents = record;
          // console.log('myComment: ', myComment);
          myComments.push(myComment);
          ctrl++;
          if(ctrl === comments.length){
            console.log('all comments handled. and renders ejs');
            console.log('myCommnts: ', myComments);
            res.render('comment_show_all',{myComments:myComments,moment:moment});
          }
        });
      });
      // console.log('end of GET my/record_show_all_c');
    });
  });


  app.get('/my/record_show_all_private',function(req,res,next){
    console.log('enter GET my/record_show_all_private');
    db.Record.find({user:req.user.username,exposure:'private'},function(err,records){
      res.render('record_show_all',{records:records, moment:moment});
    });
  });


  app.get('/record_show/:id', async function(req,res,next){
    console.log('----enter record_show/id');
    var id = req.params.id;
    console.log('id:',id);
    var comments = [];
    var record = await db.Record.findById(id)
    var commentIds = record.children;
    console.log('commentIds:', commentIds);

    if (commentIds.length > 0){
      console.log('has comments');
      var ctrl = 0;
      commentIds.forEach((id, i) => {
        console.log('id:',id);
        console.log('i:', i);
        db.Comment.findById(id,function(err,comment){
          console.log('comment id: ', );
          console.log('comment:', comment.id);
          comments.push(comment);
          ctrl++;
          if (ctrl === commentIds.length){
            console.log('all comments:', comments);
            res.render('record_show',{record:record,comments:comments,moment:moment,user:req.user});
          }
        });
      });
    }else{
      console.log('no comments');
      res.render('record_show', {record:record, comments:[],moment:moment,user:req.user});
    }
  });

  app.post('/comment_add', function(req,res,next){
    console.log('enter POST comment_add');
    const form = formidable({
      multiples:true,
      uploadDir:`${__dirname}\/..\/upload`,
      keepExtensions:true,
      maxFileSize:50*1024*1024,
      filename: function (name, ext, part, form){   //control newFilename
        console.log('name,ext :', name,ext);
        if(name=='invalid-name'){return "";}
        return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
      }
    });
    form.parse(req,(err,fields,files)=>{
      console.log('start parsing form from comment_add');
      if (err) {
        console.log('err in parsing form using formidable: ', err);
        next(err);
        return;
      }
      var id = fields.id;
      console.log('id:', id);
      var user = req.user.username;
      var project = fields.project;
      var profession = fields.profession;
      var zone = fields.zone;
      var text = fields.text;
      var caption = fields.caption;
      var file;
      if(files.file.originalFilename){
        file = files.file.newFilename;
        console.log('file selected with newFilename:', file);
      }else{
        console.log('no file selected for uploading.');
        file = '';
      }
      var parents = [id];
      var comment = new db.Comment({
        user: user,
        project: project,
        profession: profession,
        zone: zone,
        text:text,
        caption:caption,
        file:file,
        parents: parents
      });
      console.log('Adding comment:', comment);

      //downsizeImage if needed
      if (file) {
        console.log('file selected for possible downsizing...');
        utils.downsizeImage(`${__dirname}\/..\/upload\/`+file, ()=>{
          console.log('file downsized and now saving...');
          comment.save(()=>{
            console.log('Added comment saved.');
            // add child to record
            db.Record.findById(id,(err,record)=>{
              console.log('refreshing record by updating children with new added comment');
              console.log('comment.id:', comment.id);
              record.children.push(comment.id);
              record.save((err,record)=>{
                console.log('record saved with new child.');
                res.redirect('/record_edit/'+id);
                // res.render('record_edit',{record:record,moment:moment,user:req.user})
              });
            });
          });
        });
      }else{
        console.log('no file selected for comment');
        comment.save(()=>{
          console.log('Added comment saved.');
          // add child to record
          db.Record.findById(id,(err,record)=>{
            console.log('refreshing record by updating children with new added comment');
            console.log('comment.id:', comment.id);
            record.children.push(comment.id);
            record.save((err,record)=>{
              console.log('record saved with new child.');
              res.redirect('/record_edit/'+id);
              // res.render('record_edit',{record:record,moment:moment,user:req.user})
            });
          });
        });
      }

    });
  });

  app.get('/comment_delete/:id',function(req,res,next){
    console.log('enter GET /comment_delete/:id');
    var id = req.params.id;
    console.log('id:',id);
    db.Comment.findById(id,(err,comment)=>{
      console.log('found comment:',comment);
      // remove file
      if (comment.file){
        console.log('has file to remove');
        try {
          fs.unlinkSync(`${__dirname}\/..\/upload\/`+comment.file)
          console.log('original file was removed: ', comment.file);
        }catch (e){
          console.log('err removing file which is not successful: ', filename);
        }
        } else {
          console.log('no file to remove');
        }

      // remove comment.id from record.children
      db.Record.findById(comment.parents[0],(err,record)=>{
        console.log('delete comment.id from its record.children. id=', comment.id);
        record.children = record.children.filter(val => val !== comment.id);
        record.save(()=>{
          console.log('after updating record, now delete comment from db...');
          //remove comment from mongodb
          db.Comment.findByIdAndDelete(id,()=>{
            console.log('one comment deleted with id:');
            console.log('update record children...');
            res.send('remove comment successful.')
          });
        });
      });
    })
    });






  app.get('/sharefile', function(req,res,next){
    console.log('enter GET /sharefile');
    res.render('sharefile_new',{file:'',flag:''});
  });

  app.post('/sharefile', function(req,res,next){
    console.log('enter POST /sharefile');
    var flag;
    const form = formidable({
      multiples:true,
      uploadDir: `${__dirname}\/..\/share`,  // unix needs \/..\/ while windows \\..\\
      keepExtensions:true,
      maxFileSize:50*1024*1024,
      filename: function(name,ext,part,form){
        if (name =='invalid-name' || (fs.existsSync(`${__dirname}\/..\/share\/${name}${ext}`)) ) {
          console.log('invalid name or exists');
          console.log(`Path:  ${__dirname}\/..\/share\/${name}${ext}`);
          console.log(fs.existsSync(`${__dirname}\/..\/share\/${name}${ext}`));
          return " ";
        } else {
          return  name + ext;
        }
      }
    });

    form.parse(req, (err,fields,files)=>{
      console.log('start parsing form...');
      if (err) {
        console.log('err in parsing form using formidable:', err);
        next(err);
        return;
      }

      var user = req.user.username;
      var caption = fields.caption;
      var file;

      if (files.file.newFilename === " "){
        console.log('no selection or already exisits, will not save to db');
        res.render('sharefile_new', {file:files.file.originalFilename,flag:"nok"});
      } else {
        console.log('new file: ', files.file.newFilename);
        var sharefile = new db.Sharefile({
          user: user,
          file: files.file.newFilename,
          caption: caption
        });
        sharefile.save(()=>{
          console.log('ok, saved to db for one file update');
          res.render('sharefile_new',{file:files.file.newFilename,flag:'ok'})
        });
      }


      //
      //
      //
      // if (files.file.originalFilename){
      //     file = files.file.newFilename;
      //     console.log('file selected with newFilename', file);
      //   } else {
      //     console.log('no file selected for uploading.');
      //     file = null;
      //   }
      // var upload = new db.Upload({
      //     user: user,
      //     file: file,
      //     caption: caption
      //   });
      // if(!file || file==" "){
      //     console.log('file is empty or file only space, file: ',file);
      //     res.render('upload',{file:file})

      // if (fs.existsSync(`${__dirname}\/..\/share\\${files.file.originalFilename}`)) {
      //     console.log('file exists and will not save to database');
      //     res.render('upload', {file:files.file.originalFilename,flag:"exists"});
      //   } else if (!file) {
      //     console.log('!file, will not save to database');
      //     res.render('upload', {file:file, flag:'notSelect'});
      //   } else {
      //       upload.save(()=>{
      //         console.log('one document of upload saved:', upload);
      //         res.render('upload',{file:file,flag:'ok'});
      //       });
      //   }
    });
  });

  app.get('/record_remove/:id', function(req,res,next){
    console.log('enter GET /record_remove/:id');
    var id = req.params.id;
    console.log('id:',id);
    db.Record.findById(id,(err,record)=>{
      if (record.children.length > 0) {
        console.log('record has children, will not remove record.');
        res.send('The record has comments, to remove record,please remove all comments first');
      } else if (record.file) {
        console.log('record has no children but has file, will remove file first and then remove record');
        try {
          console.log('unlinkSync record.file:', record.file);
          fs.unlinkSync(`${__dirname}\/..\/upload\/${record.file}`)
          console.log('unlinkSync successful.');
          db.Record.findByIdAndDelete(id,(err,record)=>{
            console.log('findByIdAndDelete successful.');
            res.send('The record was removed successfully.')
          });
        } catch (e) {
          console.log('err removing file from record: ', e);
        }

      } else {
        console.log('record has no children and no file, will remove record');
        db.Record.findByIdAndDelete(id,(err,record)=>{
          console.log('findByIdAndDelete successful.');
          res.send('The record was removed successfully.')
        });
      }
    });
  });





};
