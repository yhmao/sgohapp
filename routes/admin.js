
var db = require('../database');
// var passport = require('../middlewares').passport;
console.log('user.js routes.');


// upload
var multer = require('multer');
var path = require('path');
var utils = require('../utils');



module.exports = function(app){

  // user managment

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
    var password = req.body.password;
    var role = req.body.role;
    console.log(username, password, role);
    await db.User.findByIdAndUpdate(id,{username,password,role});
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


};
console.log('admin.js.');
