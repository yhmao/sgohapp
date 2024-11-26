console.log('/app/my/routes.js');
const db = require('../../database');
const passport = require('../../middlewares').passport;
const formidable = require('formidable');
const path = require('path');
const router = require('express')();
const moment = require('moment');
router.set('views', path.join(__dirname,'./views'));
router.set('view engine', 'pug');
router.set('view engine', 'ejs');

const form = formidable({
  multiples:true,
  uploadDir:`${__dirname}\/..\/..\/upload`,
  keepExtensions:true,
  maxFileSize:50*1024*1024,
  filename: function (name, ext, part, form){   //control newFilename
    console.log('formidable - name,ext :', name,ext);
    if(name=='invalid-name'){return "";}
    return utils.yyyymmdd_hhmmss() + '_' + name + ext;  //newFilename= 20221010_220611_girl.jpg
  }
});




router.get('/',function(req,res,next){
  res.render('home.pug',{user:req.user});
})

// my account
router.get('/account', function(req,res,next){
  console.log('enter GET /my/account');
  res.render('account_show.pug',{user:req.user});
  console.log('res sent to client');
});

// my account edit: get form
router.get('/account/edit',function(req,res,next){
  console.log('enter GET my/account/edit');
  res.render('account_edit.pug', {user:req.user});
  console.log('res sent to client.');
});

// my account edit: post form
router.post('/account/edit', function(req,res,next){
  console.log('enter POST my/account/edit');
  let nickname = req.body.nickname;
  let cellphone = req.body.cellphone;
  let password = req.body.password;
  console.log('nickname:', nickname);
  console.log('cellphone:', cellphone);
  console.log('password:', password);
  console.log('req.user.id:', req.user.id);
  db.User.findById(req.user.id, (err,user)=>{
    user.nickname = nickname;
    user.cellphone = cellphone;
    user.password = password;
    user.save(()=>{
      console.log('user.save ok, user:',user);
      res.redirect('/my/account');
      console.log('res sent to client redirect /my/account');
    });
  });
});

router.get('/own_projects',function(req,res,next){
  let filter = {owner:req.user.username};
  if (req.user.role === 'admin') filter = {};
  db.Project.find(filter, (err,projects)=>{
    console.log('projects:', projects);
    res.render('project_list',{projects,moment});
  })
});

router.get('/current_project',function(req,res,next){
  res.render('project_current',{user:req.user});
});
router.post('/current_project',async function(req,res,next){
  let currentProject = req.body.currentProject;
  let user = await db.User.findById(req.user._id);
  console.log('user:', user);
  user.projects.splice(user.projects.indexOf(currentProject),1)
  user.projects.unshift(currentProject);
  let u = await user.save();
  res.send(`当前项目已切换至：${u.projects[0]}。请退回上页继续其他操作。`);
});


router.get('/project/:_id/show',function(req,res,next){
  let _id = req.params._id;
  console.log('_id:', _id);
  db.Project.findById(_id,(err,project)=>{
    res.render('project',{project});
  })
});

router.get('/project/:_id/edit', async function(req,res,next){
  let _id = req.params._id;
  console.log('_id:', _id);
  let project = await db.Project.findById(_id);
  let userList = await db.User.find({username:{$not:/admin/i}},{_id:0,username:1});
  let usernameList = userList.map(x => x.username );
  // console.log('usernameList1:',usernameList)
  if (!project.members.includes(req.user.username)){  // ensure owner
    project.members.unshift(req.user.username);
  }
  usernameList = usernameList.filter( e=>!project.members.includes(e));  // remaining for options
  // console.log('usernameList2:', usernameList);
  res.render('project_edit',{project,usernameList});
});

router.post('/project/:_id/edit', async function(req,res,next){
  let _id = req.params._id;
  let project = await db.Project.findById(_id);
  // let {name,description,members} = req.body;
  let name = req.body.name || project.name;
  let description = req.body.description;
  let members = req.body.members || project.members;
  if (typeof members == 'string') { members = [members];}
  
  console.log('name, description,members:', name, description,members);
  

  if (name !== project.name) {
    console.log('project name changed, update users: ', project.members)
    await project.members.forEach( async member => {
          let user = await db.User.findOne({username:member});
          if (!user.projects.includes(project.name)) {
            user.projects.push(name);
            await user.save();
          } else {
            await db.User.updateOne(
                {username:member,projects:project.name},
                {$set: {'projects.$': name   }   }).exec();            
          }
          console.log('project.name:', project.name,'name:',name);
          console.log(`${member} updated projects[${project.name}]=>${name}`);
        });
  }

  let added = members.filter(e=>!project.members.includes(e));
  console.log('added:', added);
  let removed = project.members.filter(e=>!members.includes(e));
  console.log('removed:', removed);

  added.forEach( async member=>{  // new member + project.name
    await db.User.findOneAndUpdate({username:member},{$addToSet: {projects:project.name}}).exec();
  });
  removed.forEach( async member=>{   // removed member - project.name
    await db.User.findOneAndUpdate({username:member},{ $pull: {projects:project.name}}).exec(); 
  });


  let p = await db.Project.findById(_id);
  p.name = name;
  p.description = description;
  p.members = members;
  await p.save();
  console.log('project saved.');








  res.json(project);  

});




module.exports = exports = router;

