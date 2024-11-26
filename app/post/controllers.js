
const db = require('./database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../utils');
const MOUNT = require('./mount.js');



let form = formidable({
    multiples:true,
    uploadDir:`${__dirname}\/..\/..\/uploadPost`,
    keepExtensions:true,
    maxFileSize:80*1024*1024,
    filename: function (name, ext, part, form){
        console.log('name,ext', name, ext);
        if (name === 'invalid-name') return "";
        let exists = fs.existsSync(`${__dirname}\/..\/..\/uploadPost\/${name}${ext}`);
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

module.exports.debugUse = function (req, res, next) {
    console.log(`${req.method} :  ${req.url} `)
    // res.send(`You just requested with url: ${req.url}`);
    next();
};

//---------------------

module.exports.home = async function(req,res,next) {
    console.log('home');
    res.render('home.pug');
};


module.exports.createGet = async function(req,res,next) {
    console.log('createGet');
    res.render('create.pug');
};

module.exports.createPost = async function(req,res,next) {
    console.log('createPost');
    let user = req.user.username;
    let [fields,files] = await form.parsePromise(req); 
    let doc = new db.Post({title:fields.title,text:fields.text,user:user});
    await doc.save();
    res.redirect(`${MOUNT}/edit/${doc._id}`);  
};

module.exports.showId = async function(req,res,next) {
    let id = req.params.id;
    console.log('id:',id);
    let doc = await db.Post.findById(id);
    res.render('oneShow.pug',{doc});  
};

module.exports.editId = async function(req,res,next) {
    let id = req.params.id;
    let doc = await db.Post.findById(id);
    console.log('doc:', doc);
    res.render('oneEdit.pug',{doc});  
};

module.exports.editIdPost = async function(req,res,next) {
    let id = req.params.id;
    let [fields,files] = await form.parsePromise(req);
    let doc = await db.Post.findById(id);
    doc.title = fields.title;
    doc.text = fields.text;
    console.log('title,text:', doc.title, doc.text);
    await doc.save();
    res.redirect(`${MOUNT}/edit/${doc._id}`);
};

module.exports.editIdRemove = async function (req, res, next) {
    console.log('idRemove');
    let id = req.params.id;
    console.log('id:',id); 
    await db.Post.findByIdAndDelete(id);    
    res.send(`Deleted id ${id}`);
};

module.exports.editIdUpload = async function (req, res, next) {
    console.log('upload');
    let [fields,files] = await form.parsePromise(req);
    // console.log('fields, files:', fields, files);    
    let location = `/uploadPost/${files.file.newFilename}`;
    console.log('location:', location);
    res.json({location});
    // res.send(`file: ${files.file.newFilename} uploaded.`)
};


module.exports.editTinyUpload = async function (req, res, next) {
    console.log('upload');
    let [fields,files] = await form.parsePromise(req);
    // console.log('fields, files:', fields, files);    
    let location = `/uploadPost/${files.file.newFilename}`;
    console.log('location:', location);
    console.log('{location}:',{location});
    res.json({location});
};

module.exports.editIdCommentsUpload = async function(req,res,next) {
    let id = req.params.id;
    let [fields,files] = await form.parsePromise(req);
    let text = fields.text || '';
    let caption = fields.caption || '';
    // console.log('files:', files);
    let file = files.file? files.file.newFilename : '';
    console.log('file:', file);
    // let user = req.user? req.user.username : '';
    let comment = new db.Comment({text,file,caption})
    let doc = await db.Post.findById(id);
    console.log('doc.comments.length:', doc.comments.length);
    doc.comments.push(comment);
    doc.markModified('comments');
    doc = await doc.save();
    console.log('doc.comments.length new:', doc.comments.length);    
    res.send(`上传一条评论成功: 内容【${text}】，图片【${file}】`);   
};

module.exports.editIdCommentsIndexCaption = async function(req,res,next) {
    let {id,index} = req.params;
    index = parseInt(index);
    
    let [fields,files] = await form.parsePromise(req);
    let caption = fields.caption;
    console.log('id,index,caption:', id, index, caption);
    let doc = await db.Post.findById(id);
    console.log('old caption:', doc.comments[index].caption);
    doc.comments[index].caption = caption;
    doc.comments[index].modified = Date.now();
    doc.modified = Date.now();
    doc.markModified('comments');
    doc = await doc.save();
    console.log('new caption:', doc.comments[index].caption);
    res.send(`图片/视频/文件的说明已从原来的改为【${doc.comments[index].caption}】成功！`);
};

module.exports.editIdCommentsIndexText = async function(req,res,next) {
    let {id,index} = req.params;
    index = parseInt(index);
    
    let [fields,files] = await form.parsePromise(req);
    let text = fields.text;
    console.log('id,index,text:', id, index, text);
    let doc = await db.Post.findById(id);
    console.log('old text:', doc.comments[index].text);
    doc.comments[index].text = text;
    doc.comments[index].modified = Date.now();
    doc.modified = Date.now();
    doc.markModified('comments');
    doc = await doc.save();
    console.log('new text:', doc.comments[index].text);
    res.send(`图片/视频/文件的text已从原来的改为【${doc.comments[index].text}】成功！`);
}

module.exports.editIdCommentsIndexRemove = async function(req,res,next) {
    let id = req.params.id;
    let index = parseInt(req.params.index);
    let doc = await db.Post.findById(id);
    console.log('doc.comments.length old:', doc.comments.length);
    try{ 
        if (doc.comments[index].file) fs.unlinkSync(`${__dirname}\/..\/..\/uploadPost\/${doc.comments[index].file}`)        
    }catch(err){
        console.log('err:',err);
        res.send(`删除序号为【${index}】的评论的附件时失败。`);
        return;
    }
    doc.comments.splice(index,1);
    doc = await doc.save();
    console.log('doc.comments.length new:', doc.comments.length);
    res.send(`删除序号为【${index}】的评论(含附件)成功！`);
};


module.exports.editFileRemove = async function(req,res,next) {
    console.log('remove');
    console.log('req.params:',req.params);
    let filename = req.params.filename;
    console.log('filename:', filename);
    try {
        fs.unlinkSync(`${__dirname}\/..\/..\/uploadPost/${filename}`);
    } catch (err) {
        console.log('err unlinkSync: ', err);
    }
    console.log(`${filename} removed.`);
    res.send(`removed ${filename} ok.`);
};



module.exports.list = async function(req,res,next) {
    console.log('/list');
    console.log('req.body:',req.body);
    let q = req.body;

    res.cookie('q',q);
    let {text} = req.body;    

   

    let agg;
    agg = db.Post.aggregate();

    // text = utils.makeTextSearchPost(text);
    // console.log('text:',text);
    // agg.match(text);
    if (text) { text = utils.makeTextSearchPost(text); }
    if (text) {agg.match(text);}  
    // else {agg.match({})}

    console.log('agg:',agg);
    console.log('add.pipeline():', agg.pipeline());

    let aggTotal =  db.Post.aggregate(agg.pipeline());
    aggTotal.count('count');
    // aggTotal.pipeline(): [
    //     { '$match': { '$and': [Array] } },
    //     { '$match': { dateUpdate: [Object] } },
    //     { '$count': 'count' } ] 
    console.log('aggTotal pipeline:',JSON.stringify(aggTotal.pipeline()));
    let total,pages,docs;
    try {
        total = (await aggTotal.exec())[0].count;
    } catch (err) {        
        total = pages = 0;  docs = {};
        res.render('list.pug',{docs,pages,total,user:req.user});
        return;   // 出错不再继续
    }

    console.log('total:', total);
    pages = Math.ceil(total/20);
    console.log('pages:', pages);

    // set cookie: total, pages
    res
        .cookie('total',total)
        .cookie('pages',pages)    
    agg
        .sort({dateUpdate:-1})
        .limit(20)
    console.log('agg pipeline docs :', agg.pipeline());   
    console.log(JSON.stringify(agg.pipeline()));


    docs = await agg.exec();
    console.log('docs.length:', docs.length);
    res.render('list.pug',{docs,pages,total,user:req.user})
    
};

module.exports.page = async function(req,res,next) {

    
    console.log('req.cookies:',req.cookies);
    let {q,pages,total} = req.cookies;
    console.log('q:',q);
    let {text} = q;
    let page = parseInt(req.params.page);
    pages = parseInt(pages);
    total = parseInt(total);
    console.log('page:',page);
    let sort = {'dateUpdate':-1};

    let agg = db.Post.aggregate();

    if (text) { text = utils.makeTextSearch(text); }
    if (text) {agg.match(text);}  
    if (!text) {agg.match({});}
   
    agg
        .sort(sort)
        .skip((page-1)*20)
        .limit(20)
    console.log('agg pipeline:', agg.pipeline());   
    console.log(JSON.stringify(agg.pipeline()));

    let docs = await agg.exec();
    res.render('list.pug',{docs,pages,total,page,user:req.user})

}


