
var db = require('../database');
// var passport = require('../middlewares').passport;
console.log('user.js routes.');


// upload
var multer = require('multer');
var path = require('path');
var utils = require('../utils');
var fs = require('fs');
var moment = require('moment');



module.exports = function(app){

  // user managment

  app.get('/admin', function(req,res,next){
    console.log('enter GET /admin');
    res.render('record_patrol_admin');
  });

  app.get('/admin/user_show_all', function(req,res,next){
    console.log('enter admin/show_all_users');
    db.User.find({})
      .then(users =>{
        console.log(users);
        res.render('users_all',{users:users});
      })
      .catch((error)=>{
        console.log("Error:",error);
      });
  });

  app.get('/admin/user_edit/:id', function(req,res,next){
    console.log('enter get admin/edit_user/:id');
    var id = req.params.id;
    console.log('id:',id);
    db.User.findById(id)
      .then((user)=>{
        res.render("user_edit",{user:user});
      })
  });

  app.post('/admin/user_edit', async function(req,res,next){
    console.log('enter post admin/edit_user');
    var id = req.body.id;
    var username = req.body.username;
    var nickname = req.body.nickname;
    var cellphone = req.body.cellphone;
    var password = req.body.password;
    var role = req.body.role;
    var team = req.body.team;
    var dateUpdate = Date.now();
    console.log('username, nickname,cellphone,password, role,team:');
    console.log(username, nickname,cellphone,password, role,team);
    await db.User.findByIdAndUpdate(id,{username,nickname,cellphone,password,role,team,dateUpdate});
    db.User.findById(id, function(error,user){
      console.log('updated user:', user);
      res.render("user_edit", {user:user});
    });
  });


  // zone management

  app.get('/admin/zone_show_all',function(req,res,next){
    console.log('enter admin zone_show_all');
    db.Zone.find({})
      .then((zones)=>{
        console.log('zones: ',zones);
        res.render('zone_show_all',{zones:zones})
      })
      .catch((err)=>{
        console.log('err in find zones:', err);
      })
  });

  app.get('/admin/zone_new', function(req,res,next){
    console.log('enter get admin zone_new');
    res.render("zone_new");
  });

  app.post('/admin/zone_new', async function(req,res,next){
    console.log('enter post admin zone_new');
    console.log('req.body:', req.body);
    var zoneCode = req.body.zoneCode;
    var zoneDescription = req.body.zoneDescription;

    console.log('zoneCode and zoneDescription is: ', zoneCode, zoneDescription);
    var zone = new db.Zone({zoneCode,zoneDescription});
    await zone.save();
    res.send('One zone saved.');
  });

  app.get('/admin/zone_edit/:id', function(req,res,next){
    console.log('enter admin zone_edit/:id');
    var id = req.params.id;
    console.log('id: ', id);
    db.Zone.findById(id)
      .then((zone)=>{
        res.render('zone_edit',{zone:zone})
      })
      .catch((err)=>{
        console.log('err in findById:',err);
      });
  });

  app.post('/admin/zone_edit/:id', async function(req,res,next){
    console.log('enter admin zone_edit/:id');
    var id = req.params.id;
    console.log('id: ',id);
    var zoneCode = req.body.zoneCode;
    var zoneDescription = req.body.zoneDescription;
    var userUpdate = 'userUpdate';
    var dateUpdate = Date.now();
    console.log('zoneCode and zoneDescription:', zoneCode,zoneDescription);
    await db.Zone.findByIdAndUpdate(id,{userUpdate,dateUpdate,zoneCode,zoneDescription,});
    db.Zone.findById(id, function(error,zone){
      console.log('Updated zone: ', zone);
      res.render("zone_edit", {zone:zone})
    });
  });

  //remove record :id by force, including all comments, files.
  app.get('/admin/record_remove_force/:id', function(req,res,next){
    console.log('enter GET /admin/record_remove_force/:id');
    var id = req.params.id;
    console.log('id:', id);
    db.Record.findById(id, (err,record)=>{
      // record has comments else
      if (record.children.length) {
        console.log(`record has ${record.children.length} comments to remove first...`);
        var ctrl = 0;
        // for each comment
        record.children.forEach((commentId, i) => {
          console.log(`removing comment ${i}: ${commentId}`);
          db.Comment.findById(commentId,(err,comment)=>{
            // for each comment has file
            if (comment.file) {
              console.log('comment has file: ', comment.file);
              fs.unlinkSync(`${__dirname}\/..\/upload\/${comment.file}`);
              console.log(`the file ${comment.file} has been removed.`);

              //
              db.Comment.findByIdAndDelete(comment.id, (err,comment)=>{
                if (err) { console.log('err removing comment: ', err);}
                console.log('one comment was removed from db: ', comment);
                ctrl++;

                // all comment removed, remove record
                // if has comments or else
                if (ctrl == record.children.length) {
                  console.log('all comments removed.');
                  //remove records
                  // if record has file and else
                  if (record.file) {
                    console.log(`record has file: ${record.file}`);
                    console.log('remove record file first...');
                    fs.unlinkSync(`${__dirname}\/..\/upload\/${record.file}`);
                    db.Record.findByIdAndDelete(record.id, (err,record)=>{
                      if (err) {console.log('err removing record from db: ', err);}
                      console.log('removing record from db successful.');
                      res.send('successfully removed the record with all its file and comments!')
                    });

                  // if record no file
                  } else {
                    console.log('record has no file');
                    console.log('remove record directly...');
                    db.Record.findByIdAndDelete(record.id, (err,record)=>{
                      if (err) {console.log('err removing record from db: ', err);}
                      console.log('removing record from db successful.');
                      res.send('successfully removed the record with all its file and comments!')
                    })
                  }

            // for each comment no file
                } else {

                  console.log('comment has no file.');
                  db.Comment.findByIdAndDelete(comment.id, (err,comment)=>{
                    if (err) { console.log('err removing comment: ', err);}
                    console.log('one comment was removed from db: ', comment);
                    ctrl++;
                    // all comment removed, remove record
                    if (ctrl == record.children.length) {
                      console.log('all comments removed.');
                      //remove records
                      if (record.file) {
                        console.log(`record has file: ${record.file}`);
                        console.log('remove record file first...');
                        fs.unlinkSync(`${__dirname}\/..\/upload\/${record.file}`);
                        db.Record.findByIdAndDelete(record.id, (err,record)=>{
                          if (err) {console.log('err removing record from db: ', err);}
                          console.log('removing record from db successful.');
                          res.send('successfully removed the record with all its file and comments!')
                        });
                      } else {
                        console.log('record has no file');
                        console.log('remove record directly...');
                        db.Record.findByIdAndDelete(record.id, (err,record)=>{
                          if (err) {console.log('err removing record from db: ', err);}
                          console.log('removing record from db successful.');
                          res.send('successfully removed the record with all its file and comments!')
                        })
                      }
                    }
                  });
                }
                // for each comment no file end
              });

        }
          });
        });
      // record has no comments
      } else {
        console.log('record has no comment...');
        //remove record
        if (record.file) {
          console.log(`record has file: ${record.file}`);
          console.log('remove record file first...');
          fs.unlinkSync(`${__dirname}\/..\/upload\/${record.file}`);
          db.Record.findByIdAndDelete(record.id, (err,record)=>{
            if (err) {console.log('err removing record from db: ', err);}
            console.log('removing record from db successful.');
            res.send('successfully removed the record with all its file and comments!')
          });
        } else {
          console.log('record has no file');
          console.log('remove record directly...');
          db.Record.findByIdAndDelete(record.id, (err,record)=>{
            if (err) {console.log('err removing record from db: ', err);}
            console.log('removing record from db successful.');
            res.send('successfully removed the record with all its file and comments!')
          })
        }

      }

    });
  });

  app.get('/admin/record_json_all', function(req,res,next){
    console.log('enter GET /admin/record_json_all');
    db.Record.find({},(err,records)=>{
      console.log('find all records:', records);
      // res.send('enter GET /admin/record_json_all');
      res.jsonp(records);
    });
  });

  app.get('/admin/comment_json_all', function(req,res,next){
    console.log('enter GET /admin/comment_json_all');
    db.Comment.find({}, (err,comments)=>{
      console.log('find all comments:', comments);
      // res.send('enter GET /admin/comment_json_all');
      res.jsonp(comments);
    });
  });

  app.get('/admin/sharefile_show_all', function(req,res,next){
    console.log('enter GET /admin/sharefile_show_all');
    db.Sharefile.find({},(err,sharefiles)=>{
      console.log('sharefiles:', sharefiles);
      res.render('sharefile_show_all', {sharefiles:sharefiles, moment:moment})
    });
    // db.Upload.find({},(err.uploads))
    // res.send('/admin/sharefile_show_all')
  });

  app.get('/admin/sharefile_show/:id', function(req,res,next){
    console.log('enter GET /admin/sharefile_show_all');
    var id = req.params.id;
    console.log('id:', id);
    db.Sharefile.findById(id, (err,sharefile)=>{
      res.render('sharefile_show',{sharefile:sharefile, moment:moment});
    });

  });

  app.get('/admin/sharefile_remove/:id', function(req,res,next){
    console.log('enter GET /admin/sharefile_remove/:id');
    var id = req.params.id;
    console.log('id:', id);
    db.Sharefile.findById(id, (err,sharefile)=>{
      try {
        fs.unlinkSync(`${__dirname}\/..\/share\/`+sharefile.file)
        console.log('original file was removed: ', sharefile.file);
        db.Sharefile.findByIdAndDelete(id, ()=>{
          res.redirect('/admin/sharefile_show_all');
        })
      }catch (e){
        console.log('err removing file which is not successful: ', sharefile.file);
        res.send('err removing file which is not successful: '+ sharefile.file)
      }
    });
  });

  app.get('/admin/record_patrol_log',function(req,res,next){
    console.log('enter GET /admin/record_patrol_log');
    db.Log.find({},(err,logs)=>{
      res.render('record_patrol_log',{logs:logs,moment:moment})
    });
  });




};
console.log('admin.js.');
