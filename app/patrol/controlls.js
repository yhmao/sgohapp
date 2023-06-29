
const db = require('../../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');

const path = require('path');
const utils = require('../../utils');


let form = formidable({
    multiples:true,
    uploadDir:`${__dirname}\/..\/..\/upload`,
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


module.exports.home = async function(req,res,next) {  
    res.cookie('username',req.user.username);  
    res.render('home.pug');
};

module.exports.create = async function(req,res,next) {
    let doc = new db.Record({
        project: req.user.projects[0],
        user: req.user.username,
        text: '请输入记录标题'
    });
    doc = await doc.save();
    res.redirect(`${require('./mount.js')}/edit/${doc._id}`);
}

function data2Agg(project,from,to,sort,patrolType,my,exposure,annotation,status,myResponsible,responsible,text,req,res,next) {
    let agg = db.Record.aggregate();    

    agg.match({project})

    // timeSpan (from, to, sort) 时间区间 （从，止，筛)
    if (!from){from = new Date(Date.now() - 1000*60*60*24*7)} // -7days
    if (!to) {to = new Date()} 
    console.log('from,to:',from,to);
    from = moment(from).startOf('day').toDate();
    to = moment(to).endOf('day').toDate();
    // console.log('to:',to);
    sort = sort || 'dateUpdate';
    // query objects
    let timeSpan;
    if (sort === 'date') {  timeSpan = {date:{$gte:from, $lte:to}};  } 
    else { timeSpan = {dateUpdate: {$gte:from, $lte:to}}; }
    agg.match(timeSpan);

    // patrolType 巡视类别
    if (patrolType) { patrolType = {patrolType:patrolType}; }
    if(patrolType) { agg.match(patrolType);}

    // my 我的
    if (my === 'myAll') { my = {user:req.user.username}} 
    if (my === 'myPublic') {my = {user:req.user.username,exposure:'public'}}
    if (my === 'myPrivate') {my = {user:req.user.username, exposure:'private'}}
    if (my) { agg.match(my);}

    // exposure 可见性
    exposure = exposure || 'public';    
    exposure = {exposure: exposure };
    if(exposure) { agg.match(exposure);}

    // annotation 巡视情况
    annotation = annotation;    
    if (annotation) {  annotation = {annotation: annotation}; }
    if(annotation) { agg.match(annotation);}

    // status 状态
    if (status) { agg.match({status})}

    //myResponsible
    if (myResponsible){
        myResponsible = {$or:[
            {'files.responsible':req.user.username},
            {'children.responsible': req.user.username}
        ]};
    }
    if (myResponsible) { agg.match(myResponsible); }


    // responsible
    if (responsible){
        responsible = {$or:[
            {'files.responsible':responsible},
            {'children.responsible': responsible}
        ]};
    }
    if (responsible) { agg.match(responsible); }    


    // text 文本搜索
    if (text) { text = utils.makeTextSearch(text); }
    if(text) {agg.match(text);}     
    

    // sort 排序
    sort = sort==='date'? {date:-1} : {dateUpdate:-1};


    return [project,from,to,sort,patrolType,my,exposure,annotation,status,myResponsible,responsible,text,timeSpan,agg];
    // return individul match like {exposure:'public'} or ''。
    // agg: only $match
}


module.exports.list = async function(req,res,next){
    console.log('/list');
    console.log('req.body:',req.body);
    let q = req.body;

    // q: {
    //     project: '上海大歌剧院',
    //     from: '2022-11-23',
    //     to: '2023-06-26',
    //     sort: 'dateUpdate',
    //     patrolType: '',
    //     my: '',
    //     exposure: 'public',
    //     annotation: '',
    //     status: '',
    //     myResponsible: '',
    //     responsible: '',
    //     text: '',
    //     submit: '提交'
    //   }
    res.cookie('q',q);
    // let [fields,files] = await form.parsePromise(req);
    // console.log('fields:',fields);
    let {project,from,to,sort,patrolType,my,exposure,annotation,status,myResponsible,responsible,text} = req.body;
    project = project || req.user.projects[0];
    // set cookies
    // res
    //     .cookie('from',from)
    //     .cookie('to',to)
    //     .cookie('sort',sort)
    //     .cookie('user',user)
    //     .cookie('exposure',exposure)
    //     .cookie('annotation',annotation)
    //     .cookie('patrolType',patrolType)
    //     .cookie('text',text) 

    let agg,timeSpan;
    [project,from,to,sort,patrolType,my,exposure,annotation,status,myResponsible,responsible,text,timeSpan,agg] 
        = data2Agg(project,from,to,sort,patrolType,my,exposure,annotation,status,myResponsible,responsible,text,req,res,next);

    let aggTotal =  db.Record.aggregate(agg.pipeline());
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
        .sort(sort)
        .limit(20)
    console.log('agg pipeline docs :', agg.pipeline());   
    console.log(JSON.stringify(agg.pipeline()));


    docs = await agg.exec();
    console.log('docs.length:', docs.length);
    res.render('list.pug',{docs,pages,total,user:req.user})

};

module.exports.page = async function(req,res,next){
    
    console.log('req.cookies:',req.cookies);
    let {q,pages,total} = req.cookies;
    console.log('q:',q);
    let {project,from,to,sort,patrolType,my,exposure,annotation,status,myResponsible,responsible,text} = q;
    let page = parseInt(req.params.page);
    pages = parseInt(pages);
    total = parseInt(total);
    console.log('page:',page);

    let agg,timeSpan;
    [project,from,to,sort,patrolType,my,exposure,annotation,status,myResponsible,responsible,text,timeSpan,agg] 
        = data2Agg(project,from,to,sort,patrolType,my,exposure,annotation,status,myResponsible,responsible,text,req,res,next);

    agg
        .sort(sort)
        .skip((page-1)*20)
        .limit(20)
    console.log('agg pipeline:', agg.pipeline());   
    console.log(JSON.stringify(agg.pipeline()));

    let docs = await agg.exec();
    res.render('list.pug',{docs,pages,total,page,user:req.user})

};

module.exports.oneShow = async function(req,res,next){
    let id = req.params.id;
    let doc = await db.Record.findById(id);
    res.render('one_show.pug',{doc,moment,user:req.user});
};

module.exports.oneEdit = async function(req,res,next){
    let id = req.params.id;
    let doc = await db.Record.findById(id);
 
    res.render('one_edit.pug',{doc,moment});
};

module.exports.oneRemove = async function(req,res,next){
    let id = req.params.id;
    let doc = await db.Record.findById(id);
    if (doc.files.length || doc.children.length) {
        res.send(`本条记录包含附件或评论，请先将其全部删除后再尝试！`);
        return;
    } else {
        await db.Record.findByIdAndDelete(id).exec();
        // res.send(`删除记录成功！`);
        res.redirect(`/patrol/`)
    }
}

module.exports.header  = async function(req,res,next){
    let id = req.params.id;
    let [fields,files] = await form.parsePromise(req);
    console.log('fields:',fields);
    let exposure = fields.exposure || 'public';
    let patrolType = fields.patrolType || '日常';
    let text = fields.text || '';    
    let zone = fields.zone || '';
    let profession = fields.profession || '';
    let annotation = fields.annotation || '';
    let status = fields.status || '';
    let responsible = fields.responsible || '';
    let co = fields.co || '';

    let doc = await db.Record.findById(id);
    doc.exposure = exposure;
    doc.patrolType = patrolType;
    doc.text = text;
    doc.zone = zone;
    doc.profession = profession;
    doc.annotation = annotation;
    doc.status = status;
    doc.responsible = responsible;
    doc.co = co;
    doc.dateUpdate = Date.now();
    doc = await doc.save();
    console.log(`id为【${id}】的主体信息成功更新！`);
    res.send(`id为【${id}】的主体信息成功更新！`);
    // curl -X POST http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/header -d "patrolType=safety" -d "zone=BigHall" -d "profession=installation" -d "text=textxxxx" -d "exposure=private"  -d "annotation=normal"
};

module.exports.filesUpload  = async function(req,res,next){
    let id = req.params.id;
    let [fields,files] = await form.parsePromise(req);
    let text = fields.text;
    let file = files.file.newFilename;
    console.log('text:',text);
    console.log('files.file.newFilename:', files.file.newFilename);
    let user = req.user? req.user.username : '';
    file = new db.BodyFile({user,text,file});
    let doc = await db.Record.findById(id);
    doc.files.push(file);
    doc.dateUpdate = Date.now();
    doc.markModified('files');
    doc = await doc.save();
    console.log('file uploaded:', doc.files.pop());
    res.send(`上传文件${files.file.newFilename}成功！`);
    // D:\learning\images\cv -> cmd ->
    // curl -F "file=@bird.png" -F "text=xxxxxbirdxxxxx" http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/files/upload
};

module.exports.filesCaption  = async function(req,res,next){
    let {id,index} = req.params;
    index = parseInt(index);
    
    let [fields,files] = await form.parsePromise(req);
    let text = fields.text;
    console.log('id,index,caption:', id, index, text);
    let doc = await db.Record.findById(id);
    console.log('old caption:', doc.files[index].text);
    doc.files[index].text = text;
    doc.dateUpdate = Date.now();
    doc.markModified('files');
    doc = await doc.save();
    console.log('new caption:', doc.files[index].text);
    res.send(`图片/视频/文件的说明已从原来的改为【${doc.files[index].text}】成功！`);
    // curl -X POST http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/files/2/caption -d "text=beautifulGirl!"
};

module.exports.filesRemove  = async function(req,res,next){
    let id = req.params.id;
    let index = parseInt(req.params.index);
    let doc = await db.Record.findById(id);
    console.log('files length old:', doc.files.length);
    if (doc.files[index].children.length) {
        console.log(`删除序号为【${index}】的图片视频文件带有评论，不成功！请先删除其所有评论再尝试。`)
        res.send(`删除序号为【${index}】的图片视频文件带有评论，不成功！请先删除其所有评论再尝试。`);
        return;
    }
    try{
        fs.unlinkSync(`${__dirname}\/..\/..\/upload\/${doc.files[index].file}`);
    }catch(err){
        console.log('err:',err);
        res.send(`删除序号为【${index}】的图片视频文件时失败，需联系管理员处理。`);
        return;
    }
    doc.files.splice(index,1);
    doc.dateUpdate = Date.now();
    doc.markModified('files');
    doc = await doc.save();
    console.log('files length new:', doc.files.length);
    res.send(`删除序号为【${index}】的图片视频文件成功！`);
    // curl -X GET http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/files/3/remove
};

module.exports.filesResponsible  = async function(req,res,next){
    let {id,index} = req.params;
    index = parseInt(index);
    console.log('id,index:', id, index);
    
    let [fields,files] = await form.parsePromise(req);
    let responsible = fields.responsible


    console.log('responsible:', responsible);
    let doc = await db.Record.findById(id);
    doc.files[index].responsible = responsible;
    doc.status = '跟踪';
    doc.dateUpdate = Date.now();    
    doc.markModified('files');
    doc = await doc.save();
    console.log('doc.files[index]:', doc.files[index]);
    res.send(`设置${doc.files[index].text}的负责人为:${responsible}成功！`);
    // curl -X POST http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/files/1/responsible -d "responsible=yhmao"
};

module.exports.filesCommentsAdd  = async function(req,res,next){
    let id = req.params.id;
    let index = req.params.index;
    
    let [fields,files] = await form.parsePromise(req);
    let text = fields.text;
    let user = req.user.username || '';
    console.log('text:',text);
    console.log('id, index:', id,index);
    let comment = new db.Comment({text,user});
    console.log('comment:',comment);
    let doc = await db.Record.findById(id);
    doc.files[index].children.push(comment);
    doc.dateUpdate = Date.now();
    doc.markModified('files');
    doc = await doc.save();
    console.log('saved doc.files[index]:', doc.files[index]);
    res.send(`成功添加一条评论！`);
    // await db.Record.updateOne({_id:id},{
    //     $push: {files.}
    // })

    // curl -X POST http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/files/1/comments/add -d "text=comments%20for%20files[1]" 

};

module.exports.filesCommentsRemove  = async function(req,res,next){
    let {id,index,index1} = req.params;
    console.log('id,index,index1',id,index,index1);
    index = parseInt(index);
    index1 = parseInt(index1);

    let doc = await db.Record.findById(id);
    console.log('doc.files[index].children.length before:', doc.files[index].children.length);
    doc.files[index].children.splice(index1,1);
    doc.dateUpdate = Date.now();
    doc.markModified('files');
    doc = await doc.save();
    console.log('doc.files[index].children.length after:', doc.files[index].children.length);
    res.send(`成功删除第${index1}条评论！`);
    // curl -X GET http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/files/1/comments/0/remove
};

module.exports.commentsUpload  = async function(req,res,next){
    let id = req.params.id;
    let [fields,files] = await form.parsePromise(req);
    let text = fields.text || '';
    let file = files.file? files.file.newFilename : '';
    let user = req.user? req.user.username : '';
    let comment = new db.Comment({text,file,user})
    let doc = await db.Record.findById(id);
    console.log('doc.children.length:', doc.children.length);
    doc.children.push(comment);
    doc.markModified('children');
    doc = await doc.save();
    console.log('doc.children.length new:', doc.children.length);    
    res.send(`上传一条评论成功: 内容【${text}】，图片【${file}】`);   
    // curl -F "file=@lena.jpg" -F "text=lena" http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/comments/upload
    // curl -F "text=lena a beautiful girl" http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/comments/upload
};

module.exports.commentsText  = async function(req,res,next){
    let id = req.params.id;
    let index = parseInt(req.params.index);
    
    let [fields,files] = await form.parsePromise(req);
    let text = fields.text;
    let doc = await db.Record.findById(id);
    console.log(`doc.children[index].text: ${doc.children[index].text}`);
    doc.children[index].text = text;
    doc.dateUpdate = Date.now();
    doc.markModified('children');
    doc = await doc.save();
    console.log(`doc.children[index].text: ${doc.children[index].text}`);
    res.send(`更改序号为【${index}】评论的说明为【${text}】成功！`);
    // curl -X POST http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/comments/1/text -d "text=metaverse!!!!!"       
};

module.exports.commentsRemove  = async function(req,res,next){
    let id = req.params.id;
    let index = parseInt(req.params.index);
    let doc = await db.Record.findById(id);
    console.log('doc.children.length old:', doc.children.length);
    if (doc.children[index].children.length){
        console.log(`删除序号为【${index}】评论，因其带有进一步的评论/置评，不成功！请先删除其所有评论再尝试。`);
        res.send(`删除序号为【${index}】的评论，因其带有进一步的评论/置评，不成功！请先删除其所有评论再尝试。`);
        return;
    }
    try{ 
        if (doc.children[index].file) fs.unlinkSync(`${__dirname}\/..\/..\/upload\/${doc.children[index].file}`)        
    }catch(err){
        console.log('err:',err);
        res.send(`删除序号为【${index}】的评论的图片视频文件时失败，需联系管理员处理。`);
        return;
    }
    doc.children.splice(index,1);
    doc = await doc.save();
    console.log('doc.children.length new:', doc.children.length);
    res.send(`删除序号为【${index}】的评论的图片视频文件成功！`);
    // curl -X GET http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/comments/0/remove
};

module.exports.commentsResponsible  = async function(req,res,next){
    let id = req.params.id;
    let index = parseInt(req.params.index);
    
    let [fields,files] = await form.parsePromise(req);
    let responsible = fields.responsible;
    let doc = await db.Record.findById(id);
    doc.children[index].responsible = responsible;
    doc.dateUpdate = Date.now();
    doc.markModified('children');
    doc = await doc.save();
    console.log('doc.children[index].responsible:', doc.children[index].responsible); 
    res.send(`删除序号为【${index}】的评论的负责人【${responsible}】成功！`);  
    //curl -X POST http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/comments/0/responsible -d "responsible=yhmao"
};

module.exports.commentsCommentsAdd  = async function(req,res,next){
    let id = req.params.id;
    let index = parseInt(req.params.index);
    
    let [fields,files] = await form.parsePromise(req);
    let text = fields.text;
    let user = req.user? req.user.username : '';
    let commentsComment = new db.Comment({user,text})
    let doc = await db.Record.findById(id);
    console.log(`doc.children[index].children.length old:${doc.children[index].children.length}`);
    doc.children[index].children.push(commentsComment);
    doc.dateUpdate = Date.now();
    doc.markModified('children');
    doc = await doc.save();
    console.log(`doc.children[index].children.length new:${doc.children[index].children.length}`);
    res.send(`添加序号为【${index}】的评论的置评【${text}】成功！`);    
    // curl -X POST http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/comments/0/comments/add -d "text=let me say something"
};

module.exports.commentsCommentsRemove  = async function(req,res,next){
    let id = req.params.id;
    let index = parseInt(req.params.index);  
    let index1 = parseInt(req.params.index1);      
    let doc = await db.Record.findById(id);    
    console.log(`doc.children[index].children.length old:${doc.children[index].children.length}`);
    doc.children[index].children.splice(index1,1);
    doc.dateUpdate = Date.now();
    doc.markModified('children');
    doc = await doc.save();
    console.log(`doc.children[index].children.length old:${doc.children[index].children.length}`);    
    res.send(`删除序号为【${index}】的评论的第【${index1}】条置评成功！`);
    // curl -X GET http://localhost:3000/patrol/edit/6496574209087edcae6d13a7/comments/0/comments/0/remove
};




/************** 
  /, /home    首页
  /create     新建
  /show/:id          显示
  /edit/:id          编辑
  /edit/:id/header             主体信息
  /edit/:id/files/upload                           上传附件
  /edit/:id/files/:index/caption                   附件说明
  /edit/:id/files/:index/remove                    附件删除
  /edit/:id/files/:index/responsible               负责人
  /edit/:id/files/:index/comments/add              置评
  /edit/:id/files/:index/comments/:index1/remove   删除置评
  /edit/:id/comments/upload                                上传（文字，附件，或同时）
  /edit/:id/comments/:cIndex/caption                       附件图注
  /edit/:id/comments/:cIndex/remove                        删除
  /edit/:id/comments/:cIndex/responsible                   负责人
  /edit/:id/comments/:cIndex/comments/add                  置评
  /edit/:id/comments/:cIndex/comments/:index1/remove       删除置评          

  /list             POST, 0:start
  /list/:page       GET, 1,2,... pagination


***************/