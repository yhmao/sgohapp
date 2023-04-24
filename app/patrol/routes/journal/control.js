console.log('app/patrol/routes/journal/control.js');

const db = require('../../database');
const fs = require('fs');
const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const utils = require('../../../../utils');
const doc = require('./doc.js');


const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/\/..\/\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});


let home = function(req,res,next) {
    console.log('home');
    res.render('home',{s:{},journals:[]});
};

let formDisplay = function(req,res,next) {
    console.log('form');
    res.render('form',{j:{}});
};

let edit = function(req,res,next) {
    console.log('edit');
    let _id = req.params._id;
    db.Journal.findById(_id, (err,j)=>{
        res.render('form', {j});
    })
};

let formSubmit = function(req,res,next) {
    console.log('submit');
    let day = moment(req.body.day).format('YYYY-MM-DD');
    let weather = req.body.weather;
    let temp = req.body.temp;
    let schedule = req.body.schedule;
    let quality = req.body.quality;
    let material = req.body.material;
    let others = req.body.others;
    let author = req.body.author;
    let supervisor = req.body.supervisor;
    let profession = req.body.profession;
    let user = req.body.user;

    let id = req.body.id;
    console.log('id:', id);
    if (!id) {
        console.log('!id');
        let j = new db.Journal({
            profession,day,weather,temp,schedule,quality,material,others,author,supervisor,user,
        });
        console.log('journal:', j);
        j.save( ()=>{
        res.render('form',{j:j});
        });  
    } else {
        console.log('id');
        db.Journal.findById(id, function(err,j){
            if(err){console.log('err:',err);}
            console.log('j:',j)
            j.day = day;
            j.weather = weather;
            j.temp = temp;
            j.schedule = schedule;
            j.quality = quality;
            j.material = material;
            j.others = others;
            j.author = author;
            j.supervisor = supervisor;
            j.profession = profession;
            j.dateUpdate = Date.now();
            console.log('profession:',profession);
            console.log('j:',j);
            j.save((err,j)=>{
                
                res.render('form',{j:j});
                // res.redirect('/j/edit/'+j._id, {j})
            });

        })
    }
 

  
};

let list = function(req,res,next) {
    console.log('list');
    let start = req.body.start;
    let end = req.body.end;
    let user = req.body.user;
    console.log('start,end,user:', start, end, user);
    let s = {start,end,user};
    let q = {day:{$gte:start,$lte:end}};
    db.Journal.find(q,(err,journals)=>{
        res.render('home',{journals,s});
    });
};

let show = function(req,res,next) {
    console.log('show');
    let _id = req.params._id;
    db.Journal.findById(_id, (err,j)=>{
        res.render('show',{j})
    })
}

module.exports = exports = {
    home,
    formDisplay,
    formSubmit,
    list,
    show,
    edit,
    generateJForm: doc.generateJForm,
}
