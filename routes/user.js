console.log('/routes/user.js');

var db = require('../database');
var fs = require('fs');
const formidable = require('formidable');

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



module.exports = function(app){

// get sharefile form
app.get('/sharefile', function(req,res,next){
  console.log('enter GET /sharefile');
  res.render('sharefile_new',{file:'',flag:''});
  console.log('res sent to client');
});

// sharefile upload
app.post('/sharefile', function(req,res,next){
  console.log('enter POST /sharefile');
  var flag;
  form.parse(req, (err,fields,files)=>{
    console.log('start parsing form...');
    if (err) {
      console.log('form.parse err:', err);
      next(err);
      return;
    }
    var user = req.user.username;
    var caption = fields.caption;
    console.log('req.user.username:', req.user.username);
    console.log('caption: ', caption);
    var file;
    if (files.file.newFilename === " "){
      console.log('!files.file.newFilename');
      res.render('sharefile_new', {file:files.file.originalFilename,flag:"nok"});
    } else {
      console.log('files.file.newFilename:', files.file.newFilename);
      var sharefile = new db.Sharefile({
        user: user,
        file: files.file.newFilename,
        caption: caption
      });
      sharefile.save(()=>{
        console.log('sharefile.save ok.');
        res.render('sharefile_new',{file:files.file.newFilename,flag:'ok'});
        console.log('res sent to client.');
      });
    }
  });
});


};
