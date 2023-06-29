
const db = require('../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../../utils');
const u = require('./u');


let form = formidable({
    multiples:true,
    uploadDir:`${__dirname}\/..\/\/..\/\/..\/uploadShare`,
    keepExtensions:true,
    maxFileSize:80*1024*1024,
    filename: function (name, ext, part, form){
        console.log('name,ext', name, ext);
        let exists = fs.existsSync(`${__dirname}\/..\/\/..\/\/..\/uploadShare\/${name}${ext}`);
        console.log('exists:',exists);
        return utils.yyyymmdd_hhmmss() + '_' + name + ext;
    }
});
form.parsePromise = function(req){
    return new Promise((resolve,reject)=>{
        form.parse(req, (err,fields,files)=>{
            if (err) { reject(err);}
            resolve([fields,files])            
        });
    });
};

let test = function (req, res, next) {
    console.log('test for tinymce');
    res.render('test');  
};

let testSubmit = async function(req,res,next) {
    console.log('test submit');
    let [fields,files] = await form.parsePromise(req);
    console.log('fields, files:', fields, files);
    let p = new db.Post({text:fields.m});
    await p.save();
    res.render('post',{post:p});

    // res.json(fields);

}

let upload = async function(req,res,next) {
    console.log('upload');
    let [fields,files] = await form.parsePromise(req);
    console.log('fields, files:', fields, files);   
    let location = `/uploadShare/${files.file.newFilename}`;
    console.log('location:', location);
    res.json({location});
};

let remove = async function(req,res,next) {
    console.log('remove');
    let filename = req.params.filename;
    console.log('filename:', filename);
    try {
        fs.unlinkSync(`${__dirname}\/..\/..\/..\/uploadShare/${filename}`);
    } catch (err) {
        console.log('err unlinkSync: ', err);
    }
    res.send(`removed ${filename} ok.`);
};

let debugUse = function (req, res, next) {
    console.log(`${req.method} :  ${req.url} `)
    // res.send(`You just requested with url: ${req.url}`);
    next();
};


let postForm = function(req,res,next) {
    console.log('postForm');
    res.locals.url = req.url;
    res.render('create');
}

let newPost = function (req, res, next) {
    console.log('newPost');
    console.log('req.body:', req.body);
    res.send('response from newPost');
};





module.exports = exports = {
    test,
    testSubmit,
    upload,
    remove,
    debugUse,
    postForm,
    newPost,
}