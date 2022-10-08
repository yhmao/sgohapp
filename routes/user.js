var db = require('../database');
// var passport = require('../middlewares').passport;
console.log('user.js.');


// upload

var multer = require('multer');
var path = require('path');
var utils = require('../utils');

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

  app.get(['/','/home'], function(req,res,next){
    console.log('enter home');
    console.log('req,session: ', req.session);
    console.log('req.user:', req.user);
    if (req.user){console.log('req.user.username:', req.user.username);}

    if (req.user){ res.render('home',{user: req.user.username});}
    else{ res.render('home',{user:''});
    }
  });


  app.get('/record_new',function(req,res,next){
    console.log('enter get record_new.');
    res.render('record_new');
  });
  app.post('/record_new', upload.single('file'),function(req,res,next){
    console.log('enter post record_new');
    var user = req.user.username;
    console.log('user: ', user);
    var project = req.body.project;
    var profession = req.body.profession;
    var region = req.body.region;
    var text = req.body.text;
    var caption = req.body.caption;
    var file;
    if (req.file) {file = req.file.filename}else {
      file = '';
    };
    // var file = req.file.filename;
    var record = new db.Record({user,project, profession,region,text,caption,file})
    // console.log('record from user input: ', record);
    // console.log(req.file);
    record.save();
    res.send('one record done.')
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
              res.render('record_edit',{record:record,comments:comments});
            }
          });
        });
      }else{
        console.log('no comments');
        //render without comments
        res.render('record_edit', {record:record, comments:[]});
      }
    });
  });

  app.post('/record_edit/:id', upload.single('file'), async function(req,res,next){
    console.log('enter post record_edit');
    var id = req.params.id;
    console.log('id:',id);
    console.log('req.body:', req.body);
    console.log('req.file:',req.file);
    var project = req.body.project;
    var profession = req.body.profession;
    var region = req.body.region;
    var text = req.body.text;
    var caption = req.body.caption;
    console.log('recieved form data:',project,profession,region,text,caption);
    var record = await db.Record.findById(id);
    record.project = project;
    record.profession = profession;
    record.region = region;
    record.text = text;
    record.caption = caption;
    record.dateUpdate = Date.now();
    console.log('dateUpdate:', record.dateUpdate);
    await record.save();
    db.Record.findById(id,function(err,record){
      console.log('updated record fetched from db: ', record);
      res.render('record_edit',{record:record})


    });
  });


  app.get('/record_show_all', function(req,res,next){
    db.Record.find({}, function(err,records){
      console.log('records:',records);
      res.render('record_show_all', {records:records});
    })
  });

  app.get('/my/record_show_all', function(req,res,next){
    console.log('enter my/record_show_all');
    db.Record.find({user:req.user.username},function(err,records){
      console.log('my records: ', records);
      res.render('record_show_all', {records,records})
    })
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
            res.render('record_show',{record:record,comments:comments});
          }
        });
      });
    }else{
      console.log('no comments');
      res.render('record_show', {record:record, comments:[]});
    }


      // .then((record)=>{
      //   console.log('record:',record);
      //   res.render('record_show', {record:record});
        // if (record.children) {
        //   console.log('has children');
        //   for (var i = 0; i < record.children.length; i++) {
        //     var comment = record.children[i];
        //     db.Comment.findById(record.children[i])
        //       .then((comment)=>{
        //         console.log('adding comment:', comment.id);
        //         comments.push(comment);
        //       });
        //   }
        // };
      // });
      // console.log('dbRecordfindByID',dbRecordfindByID);
      // res.send('XXXXX');

      // .finally((record,comments)=>{
      //   console.log('comments: ', comments);
      //   res.render('record_show',{record:record});
      // });
      // console.log('xxxxxx');
      // res.render('record_show', {record:dbRecordfindByID})

  });

  app.post('/comment_add', upload.single('file'), function(req,res,next){
    console.log('enter post comment_add');
    var id = req.body.id;
    var project = req.body.project;
    var profession = req.body.profession;
    var region = req.body.region;
    var text = req.body.text;
    var caption = req.body.caption;
    var file = req.file.filename;
    console.log('id,project,profession,region,text,caption,file:');
    console.log(id, project,profession,region,text,caption,file);
    console.log('req.body:',req.body);
    console.log('req.file:',req.file);
    console.log('file:',req.file);
    var parents = [id]
    var comment = db.Comment({project,profession,region,text,file,caption,parents});
    comment.save();
    db.Record.findById(id)
      .then(rec=>{
        console.log('rec.children:',rec.children);
        console.log('comment.id:',comment.id);
        rec.children.push(comment.id);
        console.log('rec:',rec);
        rec.save();
      });
    res.send('returned from comment_add');
  });


};
