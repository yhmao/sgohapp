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

    app.get('/record_patrol_menu', function(req,res,next){
      console.log('enter GET /record_patrol_menu');
      res.render('record_patrol_menu',{user:req.user});
    });


    // GET 巡视 （日常 或 安全）
    app.get('/record_patrol_new', function(req,res,next){
      console.log('enter GET /record_patrol_new');
      var patrolType = req.query.patrolType;
      console.log('patrolType:', patrolType);
      res.render('record_patrol_new',{patrolType:patrolType});
    });

    // POST 巡视 （日常 或 安全）
    app.post('/record_patrol_new', function(req,res,next){
      console.log('*****************************');
      console.log('enter POST /record_patrol_new');

      form.parse(req, (err,fields,files)=>{                                // start of form.parse
        if (err) {
          console.log('err in parsing form: ', err);
          next(err);
          return;
        }
        var filesUPloaded = [];

        if (Array.isArray(files.file)){    // multiple
          console.log('multiple files');
          files.file.forEach((f,i) => {
            filesUPloaded.push(f.newFilename);
          });
        } else if (files.file.size>0){  // one file
          console.log('one file');
          filesUPloaded.push(files.file.newFilename)
        } else {                        // no file
          console.log('no file');
        }

        console.log('filesUPloaded:', filesUPloaded);

        if (filesUPloaded.length == 0){              // no file
          console.log('no file selected');
          var user = req.user.username;
          var zone = fields.zone;
          var text = fields.text;
          var exposure = fields.exposure;
          var patrolType = fields.patrolType;
          var record = new db.Record({
            user: user,
            zone: zone,
            text: text,
            patrolType: patrolType,
            exposure: exposure,
          });
          record.save(()=>{
            res.redirect('/record_patrol/'+record.id);
          });
          return;
        }








        // if (files.file.length === undefined){                             // no file selected
        //   console.log('no file selected');
        //   var user = req.user.username;
        //   var zone = fields.zone;
        //   var text = fields.text;
        //   var exposure = fields.exposure;
        //   var patrolType = fields.patrolType;
        //   var record = new db.Record({
        //     user: user,
        //     zone: zone,
        //     text: text,
        //     patrolType: patrolType,
        //     exposure: exposure,
        //   });
        //   record.save(()=>{
        //     res.redirect('/record_patrol/'+record.id);
        //   });
        //   return;
        // }                                                                 // end of "no file selected"
                                                                        // start of files selected
        var user = req.user.username;
        var zone = fields.zone;
        var text = fields.text;
        var exposure = fields.exposure;
        var patrolType = fields.patrolType;

        var ctrl = 0;

        // var filesUPloaded = [];
        filesUPloaded.forEach((file)=>{                                         // start of forEach
          // console.log('newFilename:', f.newFilename);
          // var file = f.newFilename;
          // filesUPloaded.push(file);
          utils.downsizeImage(`${__dirname}\/..\/upload\/`+file, ()=>{     // start of downsizeImage
            ctrl ++;
            console.log('finished downsize file: ', file);
            console.log('count: ', ctrl);
            console.log('files.file.length:', filesUPloaded.length);

            if (ctrl == filesUPloaded.length){                                // all files done
              console.log('all files downsize done !!!');
              console.log('filesUPloaded:', filesUPloaded);

              var record = new db.Record({
                user: user,
                zone: zone,
                text: text,
                files: filesUPloaded,
                patrolType: patrolType,
                exposure: exposure,
              });

              record.save(()=>{
                console.log('one record just saved: ', record);
                res.redirect('/record_patrol/'+record.id);
              })
            }
          })                                                                  // end of downsizeImage
        });                                                                   // end of foreach
      });                                                                     // end of form.parse
    }); //end of POST


    // 日常 编辑 GET（进一步完善）
    app.get('/record_patrol/:id', function(req,res,next){
      console.log('enter GET /record_patrol');
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
          files.file.forEach((f,i) => {
            filesUPloaded.push(f.newFilename);
          });
        } else if (files.file.size>0){  // one file
          console.log('one file');
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
        // var user = req.user.username;

        db.Record.findById(id, (err,record)=>{
          record.status = status;
          record.annotation = annotation;
          record.exposure = exposure;
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
        console.log('found records:', records);
        res.render('record_patrol_list',{records:records,moment:moment,user:req.user});

      });

      // res.send('Response from /record_patrol_list/:patrolType/:timeSpan')
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
          query = {patrolType: 'routine'};
          break;
        case 'safety':
          query = {patrolType: 'safety'};
          break;
        case 'followup':
          query = {status: 'followup'}
          break;
        case 'closed':
          query = {status: 'closed'}
          break;
        case 'my_public':
          query = {user:req.user.username, exposure: 'public'};
          break;
        case 'my_private':
          query = {user: req.user.username, exposure: 'private'};
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
      db.Record.find(query, (err, records)=>{
        console.log('found records:', records);
        res.render('record_patrol_list',{records:records,moment:moment,user:req.user});
      });
    });















};  // end of routes