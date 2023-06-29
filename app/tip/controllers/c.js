const db = require('../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../../utils');

const form = formidable({
    multiples:true,
    uploadDir:`${__dirname}\/..\/\/..\/\/..\/uploadTips`,
    keepExtensions:true,
    maxFileSize:50*1024*1024,
    filename: function (name, ext, part, form){
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    let fileType = getFileType(name);
    if (fileType in ['image', 'video', 'audio']) {
        let namePrefix = '_' + fileType.charAt(0).toUpperCase + fileType.slice(1) + '.';
        return utils.yyyymmdd_hhmmss() + namePrefix + ext;  //newFilename= 20221010_220611_Image.jpg
    } else {
        return name;   // file original name
    }
}
});

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'gif','png','tiff','eps','bmp','webp'];
const VIDEO_EXTENSIONS = ['mov', 'mp4', 'wmv','avi','flv','mkv','webm','f4v','swf'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg','aac','aif' ];
let getFileType = function(filename) {
    let ext = filename.split('.')[-1].lower();
    let fileType = '';
    if (ext in IMAGE_EXTENSIONS) { fileType = 'image'; } 
    else if (ext in VIDEO_EXTENSIONS) { fileType = 'video'; }
    else if (ext in AUDIO_EXTENSIONS) { fileType = 'audio'; }
    else { fileType = 'file'; }
    return fileType    
};
let nowToString = function() {

};
let newFilename



let test = function (req, res, next) {
    res.send('test from controller');
};



let create = function (req,res,next) {
    res.render('create');
};

let createSubmit = async function(req,res,next) {
    let cat1 = req.body.cat1;
    let cat2 = req.body.cat2;
    let title = req.body.title;
    let content = req.body.content;
    console.log( 'cat1, cat2, title: ', cat1, cat2, title);
    console.log('content:', content);
    let tip = new db.Tip({cat1,cat2,title,content});
    await tip.save();
    tip = await db.Tip.findById(tip._id);
    res.render('edit',{tip});

}

let search = function (req,res,next) {
    res.render('search');
};

let searchSubmit = function (req,res,next) {

};

let showOne = function (req,res,next) {

};

let editOne = function (req,res,next) {

};

let sendFile = function (req,res,next) {

};

let addCommentText = function (req,res,next) {

};

let addCommentFile = function (req,res,next) {
    let id = req.params.id;
    form.parse(req, (err, fields, files) => {
        if (err) { console.log('err:', err); next(err); return;}
        let caption = fields.caption;
        let file = files.file.newFilename;
        console.log('caption:', caption);
        console.log('file:', file);

        let comment = db.Comment({file})


    })
};

let removeComment = function (req,res,next) {

};

let editComment = function (req,res,next) {

};

















module.exports = exports = {
    test,
    create,
    createSubmit,
    search,
    searchSubmit,
    showOne,
    editOne,
    sendFile,
    addCommentText,
    addCommentFile,
    removeComment,
    editComment,
}