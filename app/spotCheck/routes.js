const path = require('path');


const router = require('express')();
const c = require('./controllers.js');


router.set('views', path.join(__dirname,'./views'));
router.set('view engine', 'pug');

router.use(c.scLog)

/**
 * fp检查
 */
router.post('/fpCheck', c.fpCheck);

/**
 * 入口扫码：进入，离开
 */
router.get('/:project/:spot/in',c.projectSpotInGet);
router.post('/:project/:spot/in',c.projectSpotInPost);
router.get('/:project/:spot/out', c.projectSpotOut);
router.post('/:project/:spot/out', c.projectSpotOutPost);
router.post('/:project/:spot/record', c.projectSpotRecord);
router.post('/upload', c.upload);

router.get('/user/register', c.userRegisterGet);
router.post('/user/register',c.userRegisterPost);
router.post('/user/addFp',c.userAddFp)


/**
 * 聚合报告
 */
router.get('/find/inOut/:d', c.findUserInOut);
router.post('/find/inOut', c.findUserInOut)
router.get('/find/count/inOut/:d', c.findInOutCount);
router.post('/find/count/inOut/', c.findInOutCount);
router.get('/find/record/spotReport/:spot/:days', c.spotReport);
router.post('/find/record/spotReport/:type', c.spotReport);


/**
 * 用户自己的记录
 */
router.get('/user/find/:cellphone/recordList',c.userRecordList);
router.get('/user/find/:cellphone/inOutList', c.userInOutList);

router.get('/self/record/find/:cellphone/', c.selfRecordFind);  // 用户本人的记录，前20条

router.get('/record/show/:id', c.recordShowId);  // 显示
router.get('/record/edit/:id', c.recordEditId);  // 编辑
router.post('/record/edit/:id', c.recordEditId);  // 提交编辑
router.get('/record/delete/:id', c.recordDeleteId);  // 删除
router.get('/record/file/delete/:filename', c.recordFileDelete); //删除文件，同时更新数据库

//==================
router.get('/test', c.test);
router.post('/test',c.test);



router.get('/', c.home);
router.get('/home',c.home);
router.get('/:project/:spot', c.projectSpot);
router.post('/:project/:spot/arrival', c.projectSpotArrival);  // scanned spot qr
router.post('/:project/:spot/submit', c.projectSpotSubmit);  // checklist



//管理员功能菜单
router.get('/admin', c.admin);  // menu for admin

//用户管理
router.get('/admin/user/add', c.adminUserAddGet);  // admin add new user
router.post('/admin/user/add', c.adminUserAddPost);  // admin add new user
router.get('/admin/user/find', c.adminUserFind); // admin find user form
router.post('/admin/user/find', c.adminUserFind); // admin find user result
router.get('/admin/user/delete/:id', c.adminUserDeleteId);   // admin delete a user
router.get('/admin/user/edit/:id',c.adminUserEditId);   // admin edit a user form
router.post('/admin/user/edit/:id',c.adminUserEditId);   // admin edit a user form submit

//二维码工具
router.get('/admin/qr/qr/', c.qr);   // 申请二维码
router.post('/admin/qr/qr/:type', c.qr);  // 生成二维码，显示或下载

//场所管理Spot
router.get('/admin/spot/add', c.spotAdd);
router.post('/admin/spot/add', c.spotAdd);
router.get('/admin/spot/find', c.spotFind);
router.post('/admin/spot/find', c.spotFind);
router.get('/admin/spot/show/:id', c.spotShowId);
router.get('/admin/spot/edit/:id', c.spotEditId);
router.post('/admin/spot/edit/:id', c.spotEditId);
router.get('/admin/spot/clone/:id', c.spotCloneId);




router.get('/:project/user/register', c.projectUserRegisterGet);  // project user register form
router.post('/:project/user/register', c.projectUserRegisterPost);   // project user register form submit
router.get('/:project/user/:id/update',c.projectUserIdUpdateGet);   // project user update form (new fp, if not register)
router.post('/:project/user/:id/update', c.projectUserIdUpdatePost);   // project user update submit (confirm for new fp)

module.exports = router;