const { StringContainer } = require('docx');

const MBP_Ali   = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

const URI = MBP_Ali;
console.log('Connect ALI db from apple MBP.')

const Mongoose = require('mongoose').Mongoose
const mongoose = new Mongoose();
mongoose.connect(URI);

/**
 * Spot Checker 
 * Role: 监理，总包项目，安全主管，总包安全，分包管理，分包安全，班组负责，工人
 */
const scUser = new mongoose.Schema({
    Fps: [String],
    Name: String,
    Cellphone: String,
    Password: String,
    Role: String,
    Right: {type:String,Default:"user"},  // 权限
    DateCreated: {type:Date, default:Date.now},
    DateUpdated: {type: Date, default: Date.now},
},{statics:false});
const SCUser = mongoose.model('SCUser', scUser);
module.exports.SCUser = SCUser;
    
/**
 * Spot Check Record
 * spot info: project,spot
 * checker info: name, phone
 * list result [ ]: {item1:no/nok/?}
 * files [ ]: photos
 */
const scRecordSchema = new mongoose.Schema({
    Project: String,
    Spot: String,
    User: String,
    Cellphone: String,
    Role:String,
    Text: String,
    DateCreated: {type:Date, default: new Date()},
    List: [{Item: String, Status: String, _id: false}],
    Files: [String],
}, {statics:false});
const SCRecord = mongoose.model('SCRecord', scRecordSchema);
module.exports.SCRecord = SCRecord;

/**
 * SCInOut: 进出场
 */
const scInOutSchema = new mongoose.Schema({
    Project: String,
    Spot: String,   
    Name: String,
    Cellphone: String,
    Clock: Date,  // timestamp
    InOut: String,  // in / out
}, {statics:false})
const SCInOut = mongoose.model('SCInOut', scInOutSchema);
module.exports.SCInOut = SCInOut;


/**
 * SCSpot: check spot infor
 * [Project,Spot]: unique
 * List: check list
 */
const scSpotSchema = new mongoose.Schema({
    Project: String,
    Spot: String,   
    DateCreated: {type: Date, default: new Date()},
    Qrcode: String,    // Qrcode image file name
    CheckListName: String,
    CheckList: [String],
}, {statics:false});
const SCSpot = mongoose.model('SCSpot', scSpotSchema);
module.exports.SCSpot = SCSpot;

/**
 * SCCheckList: check plan for spot
 * Name: for query
 * CheckList: [ checkitem ]
 */
const scCheckList = new mongoose.Schema({
    Name: String,
    CheckList: [String],   
    DateCreated: {type: Date, default: new Date()},
}, {statics:false});
let SCCheckList = mongoose.model('SCCheckList', scCheckList);
module.exports.SCCheckList = SCCheckList;

/**
 * Log for spotCheck
 */
const scLog = new mongoose.Schema({
    DateCreated: {type: Date, default: new Date()},
    Name: String,
    Fp: String,
}, {statics:false});
let SCLog = mongoose.model('SCLog',scLog);
module.exports.SCLog = SCLog;


//======================

let makeOneSCCheckList = function(){
    let Name = 'firstCheckList';
    let CheckList = [
        "动火区",
        "安全行为",
        "安全监护",
        "脚手架",
        "墙面粉刷质量",
    ];
    let scCheckList = new SCCheckList({
        Name,
        CheckList
    });
    scCheckList.save((err,doc)=>{
        if(err){
            console.log(`err saving, err: ${err}`);
        } else {
            console.log(`saved: `, doc)
        }
    })
}
// makeOneSCCheckList();

let makeOneSCSpot = async function(){
    let Project = 'sgoh';
    let Spot = '001';
    let CheckListName = 'firstCheckList';    
    let CheckList = (await SCCheckList.find({Name:CheckListName}))[0]['CheckList']
    console.log("Get CheckList:", CheckList);
    let scSpot = new SCSpot({
        Project,
        Spot,
        CheckListName,
        CheckList
    });
    let doc = await scSpot.save();
    console.log('saved SCSpot:', doc);
}
// makeOneSCSpot()