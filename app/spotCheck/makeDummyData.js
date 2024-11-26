const {SpotChecker,CheckRecord, SCUser, SCRecord, SCInOut,SCCheckList, SCSpot} = require('./database')
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const utils = require('../../utils');

let spots = ['001', '002', '003', '004', '005'];
let users = ['老毛','小宗','袁坚平','罗博','张帅','徐畅'];
let cellphones = ['18621890022', '15262737623', '15900780139', '18813070996', '18855577834','15000987446'];
let CheckList = [
    '动火监护',
    '安全措施',
    '临边围护',
    '安全设施完整性',
];

/**
 * 函数
 * @returns 随机记录表
 */
let MakeCheckList = function() {
    let list = [];
    for (var i = 0; i < CheckList.length; i++) {
        let item = {
            Item: CheckList[Math.floor(Math.random()*(CheckList.length))],
            Status: Math.random()>0.2?"OK":"NOK",
        };
        list.push(item)
    }
    return list;
}


/**
 * 生成记录
 * @param {*} n 记录数
 */
let makeRecords = async function(n) {
    let span = 30;  // 现在往前天数
    for (var i = 0; i< n; i++) {

        //数据库随机找用户
        let user1 = (await SCUser.aggregate([
            {$sample:{size:1}}
        ]).exec())[0]
        let Cellphone = user1.Cellphone;
        let Role = user1.Role;
        let User = user1.Name;
        console.log(`User: ${User},Cellphone:${Cellphone},Role:${Role} `)

        let Project = "上海大歌剧院";
        let Spot = spots[Math.floor(Math.random()*(spots.length))];        
        let DateCreated = new Date(
            Date.now() + (Math.random()-1.0)*1000*3600*24*span
        );
        let List = MakeCheckList();

        let scRecord = new SCRecord({Project,Spot,User,Cellphone,Role,DateCreated,List});
        scRecord = await scRecord.save()
        console.log("scRecord:", scRecord)

        console.log("\n==============\n")
    }    
}
makeRecords(326);



/**
 * 随机生成出入场记录至Db
 * @param {*} n 进出场记录对总数
 */
let makeInOut = async function(n) {
    let users = await (await SCUser.find({},{Name:1,Cellphone:1,_id:0}));
    let cellphones = users.map(
        (user) => user.Cellphone
    )
    users = users.map(
        (user) => user.Name
    )
    console.log('users:', users)
    console.log('cellphones:', cellphones)
    let makeOne = function(){
        let Project = "上海大歌剧院";
        let Spot = spots[Math.floor(Math.random()*(spots.length))];
        let Name = users[Math.floor(Math.random()*(users.length))];
        let Cellphone = cellphones[
            users.indexOf(Name)
        ];

        //in 过去N天时间，
        let N = 5;
        let Clock = new Date(
            Date.now() + (-Math.random())*1000*3600*24*N
        );
        let InOut = 'in';
        let scInOut = new SCInOut({Project,Spot,Name,Cellphone,Clock,InOut});
        scInOut.save();
        console.log('in:', scInOut)        

        //out
        let stay = 2  //(逗留最长时间)
        Clock = new Date(
            Clock.getTime() + Math.random()*1000*3600*stay   // 入场后8小时内随机出
        );
        InOut = 'out';
        scInOut = new SCInOut({Project,Spot,Name,Cellphone,Clock,InOut})
        console.log('out', scInOut)
        scInOut.save()
    }

    for (var i = 0; i<n; i++) {
        makeOne();
        console.log('=========')
    }
}
makeInOut(500);


/**
 * 用户至Db
 * XLSX => DB
 */

let makeSCUsersDb = async function() {
    let fs = require('fs');
    let XLSX = require('xlsx');

    let dataJson = XLSX.utils.sheet_to_json(
        XLSX.readFile('dummyUsers.xlsx').Sheets['Sheet1']
    )
    // console.log('data from xlsx:', dataJson)

    dataJson.forEach(async (line,index)=>{
        let scUser = new SCUser(line)
        // console.log('one scUser:', scUser)
        await scUser.save();
        console.log('saved:', index)
    })
}

// makeSCUsersDb();














// makeUsers();
// makeRecords();
// makeInOut(2000);
