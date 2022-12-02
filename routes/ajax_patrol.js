/*



/record_patrol/:id/body_text_ajax/new
/record_patrol/:id/body_text_ajax/edit

/record_patrol/:id/body_image_image_add_ajax
/record_patrol/:id/body_image_text_add_ajax/:fileId
/record_patrol/:id/body_image_remove_ajax/:fileId  //remove text and image if no review
/record_patrol/:id/body_image_review_add_ajax/:fileId
/record_patrol/:id/body_image_review_remove_ajax/:fileId/:reviewId

/record_patrol/:id/body_video_video_add_ajax
/record_patrol/:id/body_video_text_add_ajax/:fileId
/record_patrol/:id/body_video_remove_ajax/:fileId  //remove text and video if no review
/record_patrol/:id/body_video_review_add_ajax/:fileId
/record_patrol/:id/body_video_review_remove_ajax/:fileId/:reviewId

/record_patrol/:id/comment/add_ajax   // newly add text and/or image
/record_patrol/:id/comment/:commentId/text_edit_ajax
/record_patrol/:id/comment/:commentId/image_add_ajax
/record_patrol/:id/comment/:commentId/image_remove_ajax
/record_patrol/:id/comment/:commentId/remove_ajax
/record_patrol/:id/comment/:commentId/review_add_ajax
/record_patrol/:id/comment/:commentId/:reviewId/review_remove_ajax











*/

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



//routes
module.exports = function(app){   // start of routes


  app.get('/record_patrol/:id/body_text_ajax/new',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_text_ajax/new  ');
  res.send('Response from: /record_patrol/:id/body_text_ajax/new, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_text_ajax/edit',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_text_ajax/edit  ');
  res.send('Response from: /record_patrol/:id/body_text_ajax/edit, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_image_image_add_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_image_image_add_ajax  ');
  res.send('Response from: /record_patrol/:id/body_image_image_add_ajax, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_image_text_add_ajax/:fileId',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_image_text_add_ajax/:fileId  ');
  res.send('Response from: /record_patrol/:id/body_image_text_add_ajax/:fileId, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_image_remove_ajax/:fileId',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_image_remove_ajax/:fileId  ');
  res.send('Response from: /record_patrol/:id/body_image_remove_ajax/:fileId, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_image_review_add_ajax/:fileId',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_image_review_add_ajax/:fileId  ');
  res.send('Response from: /record_patrol/:id/body_image_review_add_ajax/:fileId, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_image_review_remove_ajax/:fileId/:reviewId',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_image_review_remove_ajax/:fileId/:reviewId  ');
  res.send('Response from: /record_patrol/:id/body_image_review_remove_ajax/:fileId/:reviewId, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_video_video_add_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_video_video_add_ajax  ');
  res.send('Response from: /record_patrol/:id/body_video_video_add_ajax, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_video_text_add_ajax/:fileId',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_video_text_add_ajax/:fileId  ');
  res.send('Response from: /record_patrol/:id/body_video_text_add_ajax/:fileId, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_video_remove_ajax/:fileId',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_video_remove_ajax/:fileId  ');
  res.send('Response from: /record_patrol/:id/body_video_remove_ajax/:fileId, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_video_review_add_ajax/:fileId',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_video_review_add_ajax/:fileId  ');
  res.send('Response from: /record_patrol/:id/body_video_review_add_ajax/:fileId, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/body_video_review_remove_ajax/:fileId/:reviewId',function(req,res,next){
  console.log('enter  /record_patrol/:id/body_video_review_remove_ajax/:fileId/:reviewId  ');
  res.send('Response from: /record_patrol/:id/body_video_review_remove_ajax/:fileId/:reviewId, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/comment/add_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/comment/add_ajax  ');
  res.send('Response from: /record_patrol/:id/comment/add_ajax, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/comment/:commentId/text_edit_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/comment/:commentId/text_edit_ajax  ');
  res.send('Response from: /record_patrol/:id/comment/:commentId/text_edit_ajax, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/comment/:commentId/image_add_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/comment/:commentId/image_add_ajax  ');
  res.send('Response from: /record_patrol/:id/comment/:commentId/image_add_ajax, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/comment/:commentId/image_remove_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/comment/:commentId/image_remove_ajax  ');
  res.send('Response from: /record_patrol/:id/comment/:commentId/image_remove_ajax, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/comment/:commentId/remove_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/comment/:commentId/remove_ajax  ');
  res.send('Response from: /record_patrol/:id/comment/:commentId/remove_ajax, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/comment/:commentId/review_add_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/comment/:commentId/review_add_ajax  ');
  res.send('Response from: /record_patrol/:id/comment/:commentId/review_add_ajax, 该功能尚未开通！');
  });


  app.get('/record_patrol/:id/comment/:commentId/:reviewId/review_remove_ajax',function(req,res,next){
  console.log('enter  /record_patrol/:id/comment/:commentId/:reviewId/review_remove_ajax  ');
  res.send('Response from: /record_patrol/:id/comment/:commentId/:reviewId/review_remove_ajax, 该功能尚未开通！');
  });





















};  // end of routes
