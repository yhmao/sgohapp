const { NA } = require('xlsx-populate/lib/FormulaError');
const {SpotChecker,CheckRecord, SCUser, SCRecord, SCInOut,SCCheckList, SCSpot,SCLog} = require('./database')
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const utils = require('../../utils');

/**
 * 处理文件上传
 * 文件夹: /uploadSpotCheck/
 * 重命名: 20240331_212345_image.jpg
 */
let form = formidable({
    multiples:true,
    uploadDir:`${__dirname}\/..\/..\/uploadSpotCheck`,
    keepExtensions:true,
    maxFileSize:80*1024*1024,
    filename: function (name, ext, part, form){
        console.log('name,ext', name, ext);
        let exists = fs.existsSync(`${__dirname}\/..\/..\/uploadSpotCheck\/${name}${ext}`);
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


module.exports.scLog = async function(req,res,next){
    console.log("Logging...")
    // console.log('session:', session)
    next();
}

/**
 * Check req fp (fingerprint) by comparing with db
 * Returns comparing result: 1. exist with valid user, 2. not exist
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.fpCheck = async function(req,res,next) {
    let fp = req.body.fp;
    console.log(`received fp from client: ${fp}`);
    let count = await SCUser.find({Fps:fp}).count();
    let err;
    SCUser.findOne({Fps:fp},(err,user)=>{
        if (err) {
            console.log(`fp检查出错: ${fp}`);
            res.json({err});
            return;
        } else if (!user) {
            console.log(`fp未找到用户`)
            res.json({user:{},count:0});
            return;
        }        
        console.log(`found user:`, user);
        if (count == 1) {
            console.log('fp找到唯一用户')
            // 正常情况，找到唯一一个用户
            res.json({user,count})
        }
        if (count > 1) {
            // 非正常情况，找到几个用户
            console.log(`fp找到多个用户: ${found}个`)
            res.json({user,count})
        }
    })
}


/**
 * 用户使用新的客户端时
 * 增添fp
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.userAddFp = async function(req,res,next) {
    console.log('用户提交 req.body:', req.body);
    let {text, fp} = req.body;
    let user;

    // 判断提交字符，查数据库，得到用户
    if (text.match(/^\d{5,11}$/i)) {
        console.log('提交为电话')
        user = await SCUser.findOne({Cellphone:text});
    } else {
        console.log('提交为名字')
        user = await SCUser.findOne({Name: text})
    }
    // 数据没找到用户
    if (!user) {
        console.log(`名字或电话找不到用户`);
        user = {};
        res.json({user})
    } else {
        // 数据库找到用户
        console.log(`名字或电话有用户: ${user}`);
    }

    // 不含fp
    if (user.Fps.indexOf(fp) == -1 ) {
        console.log(`用户无该fp ${fp} 记录.`)
        user.Fps.push(fp);
        user.DateUpdated = Date.now();
        user =  await user.save();
        console.log(`添加: ${fp} 至用户,\n 更新的用户：`, user);
        res.json({user})
    // 含fp
    } else {
        console.log(`用户有已fp ${fp} 记录。返回空对象。`)
        res.json({user: {}})
    }

}


/**
 * 进入扫码
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectSpotInGet = async function(req,res,next) {
    let project = req.params.project;
    let spot = req.params.spot;
    // spot checklist
    let scSpots = await SCSpot.find({Spot:spot});
    // 如无对应巡查点资料，提供模拟
    if (scSpots.length == 0) {
        scSpots =    [{
            "_id": {
              "$oid": "6606bbfbef170e03af0b442d"
            },
            "Project": "sgoh",
            "Spot": "未知场所",
            "DateCreated": {
              "$date": "2024-03-29T13:02:50.551Z"
            },
            "CheckListName": "模拟检查清单",
            "CheckList": [
              "动火监护",
              "安全措施",
              "临边围护",
              "安全设施完整性",
            ],
            "__v": 0
          }]
    }
    console.log('scSpots:', scSpots);
    let CheckList = scSpots[0]['CheckList'];
    res.render('spotIn.pug',{project, spot,CheckList});
}

/**
 * 确认进场
 * 记入db
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectSpotInPost = async function(req,res,next) {
    let data = {project,spot,username,cellphone} = req.body;

    console.log(`Client submitted data: ${data}`);
    // save in record

    let scInOut = new SCInOut({
        Project: project,
        Spot: spot,
        Name: username,
        Cellphone: cellphone,
        InOut: 'in',
        Clock: new Date(),
    })
    let doc = await scInOut.save();
    console.log("进场记录已保存：", doc)
    res.json({doc})
}

/**
 * 离开扫码
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectSpotOut = async function(req,res,next) {
    let project = req.params.project;
    let spot = req.params.spot;
    console.log(`用户提交 project:${project}, spot:${spot}`)

    let scSpots = await SCSpot.find({Spot:spot});
    // 如无对应巡查点资料，提供模拟
    if (scSpots.length == 0) {
        scSpots =    [{
            "_id": {
              "$oid": "6606bbfbef170e03af0b442d"
            },
            "Project": "sgoh",
            "Spot": "005",
            "DateCreated": {
              "$date": "2024-03-29T13:02:50.551Z"
            },
            "CheckListName": "模拟检查清单",
            "CheckList": [
                "动火监护",
                "安全措施",
                "临边围护",
                "安全设施完整性",
            ],
            "__v": 0
          }]
    }
    console.log('scSpots:', scSpots);
    let checkList = scSpots[0]['CheckList'];
    console.log(`project:${project},spot:${spot},checkList:${checkList}`)

    res.render('spotOut.pug',{project,spot,checkList})
}

/**
 * 确认离场
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectSpotOutPost = async function(req,res,next) {
    let project = req.body.project;
    let spot = req.body.spot;
    let fp = req.body.fp;
    let username = req.body.username;
    let cellphone = req.body.cellphone;
    console.log(`Client submitted project: ${project}, spot: ${spot}, username: ${username},cellphone: ${cellphone}, fp: ${fp}`);

    let users = await SCUser.find({Fps:fp})
    if (users.length > 1) {
        console.log('入场扫码时发现不止一个用户对应fp');
    }

    // 人员离场记录
    let scInOut = new SCInOut({
        Project:project,
        Spot:spot,
        Name: username,
        Cellphone: users[0].Cellphone,
        InOut: 'out',
        Clock: new Date(),
    })

    console.log("离场记录：", scInOut)
    let doc = await scInOut.save();
    console.log("进场记录已保存：", doc)

    res.json({doc})
}



/**
 * 处理客户离场时提交的巡视报告
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectSpotRecord = async function(req,res,next) {
    let data = req.body;
    console.log(`Client reported form data:`,data)
    let List = [];
    Object.keys(data).forEach(function(key){
        if (!key.match(/^[A-Za-z]*$/i)) {
            List.push({Item: key, Status: data[key]})
        }
    });

    let scRecord = new SCRecord({
        Project: data["project"],
        Spot: data["spot"],
        User: data["username"],
        Role: data["role"],
        Cellphone: data["cellphone"],
        Text: data["text"],
        List: List,
    });

    let doc = await scRecord.save();
    console.log('saved record:', doc);
    res.json({doc});
}

/**
 * 巡视照片上传
 * 可多个照片
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.upload = async function(req,res,next) {
    let [fields,files] = await form.parsePromise(req);
    // console.log('fields:', fields);
    // console.log('files:', files);

    if (!fields || !fields.docId) {    // 未找到对应记录：文件已上传，记录不更新
        console.log(`找不到上传照片需要对应的记录_id.`)
        res.json({err:"找不到上传照片需要对应的记录_id。所选照片但所选文件已被上传,但未能记入数据库。"});
        return;
    }

    let _id = fields.docId;

    let filenames = [];
    if (!Array.isArray(files.files)) {   // 单个文件
        filenames.push(files.files.newFilename)
    } else {                             // 多个文件
        files.files.forEach((f)=>{
            filenames.push(f.newFilename)
        });        
    }

    console.log(`未去掉thumbnail时的文件名列表：`,filenames)

    // 去掉thumbnail
    filenames = filenames.filter(
        filename => ! (/thumbnail/.test(filename))
    )

    console.log('上传文件名列表：',filenames)
    let doc = await SCRecord.findById(_id);
    console.log(`Found record with id ${_id}: ${doc}`);
    doc.Files = doc.Files.concat(filenames);    // 添加新上传的文件名到记录中
    doc = await doc.save();
    console.log(`record updated with added photo, updated record: ${doc}`);
    res.json({doc})
}
 
/**
 * 用户新注册 表
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.userRegisterGet = async function(req,res,next) {
    res.render('userRegister.pug')
}

module.exports.userRegisterPost = async function(req,res,next) {
    let {name,cellphone,password,role} = req.body;
    console.log(`user register submit data: \nName:${name}\nCellphone:${cellphone}\nrole:${role}\nPassword:${password}.`);
    // create new SCUser
    let user = new SCUser({
        Name: name, 
        Cellphone: cellphone, 
        Role: role,
        Password: password});
    user = await user.save();
    console.log('user saved:', user);
    res.json({user})
}

module.exports.selfRecordFind = async function (req, res, next) {
    let cellphone = req.params.cellphone;
    let records = await SCRecord.find({Cellphone:cellphone});
    res.render('records.pug', {docs:records})

    
}

module.exports.recordShowId = async function (req, res, next) {
    let id = req.params.id;
    let record = await SCRecord.findById(id);
    res.render('record.pug',{record})
}

module.exports.recordEditId = async function (req, res, next) {
    if (req.method == 'GET') {
        let id = req.params.id;
        let record = await SCRecord.findById(id);
        res.render('recordEdit.pug',{doc:record, moment})
    } else if (req.method == 'POST') {
        let data = req.body;
        console.log(`Client reported form data:`,data)
        let List = [];
        Object.keys(data).forEach(function(key){
            if (!key.match(/^[A-Za-z_]*$/i)) {
                List.push({Item: key, Status: data[key]})
            }
        });

        let scRecord = await SCRecord.findById(data._id);
        console.log(`scRecord: ${scRecord}`)
        console.log(`new List: ${List}`)

        scRecord.List = List
        scRecord.Text = data['Text']
    
    
        let doc = await scRecord.save();
        console.log('saved record:', doc);

        res.send('记录已成功更新！')
    } else {
        res.send(`request is not get nor post.`)
    }
    
}

module.exports.recordFileDelete = async function (req, res, next) {
    let file = req.params.filename;
    let thumbFile = path.basename(file, path.extname(file)) + '_thumbnail' + path.extname(file);
    
    let result = await SCRecord.findOneAndUpdate(
        {Files: file},
        {$pull: {Files: file}},
        {new: true}
    )
    if (result) {
        console.log(`成功从数据库文件列表中中删除该文件`);
        try {
            fs.unlinkSync(path.join('__dirname','../uploadSpotCheck',file));
            console.log(`removed: ${file}`);    
            fs.unlinkSync(path.join('__dirname','../uploadSpotCheck',thumbFile));
            console.log(`removed: ${thumbFile}`);   
            res.send(`成功删除所选图片并更新记录`) 
        } catch (err) {
            console.log(`err: ${err}`)
            console.log(`记录已更新，但删除文件不成功`)
            res.send(`记录已更新，但删除文件不成功`)
        }
    } else {
        console.log(`未能找到并更新数据库记录`);
        res.send(`未能找到对应该图的记录或虽然找到但未能更新记录`)
    }


    
}

module.exports.recordDeleteId = async function (req, res, next) {
    let id = req.params.id;
    let record = await SCRecord.findById(id)
    // 删除所含照片
    if (record.Files && record.Files.length > 0) {
        console.log(`记录中包含图片文件，请先删除所有图片后再删除记录`);
        res.send(`记录中包含图片文件，请先删除所有图片后再删除记录`);
        return;
    }

    await SCRecord.findByIdAndDelete(id)    
    console.log(`recordDeleteId: ${record}`)
    res.send(`成功删除该条记录，本记录已不存在，本页面无法刷新出结果，请回到先前页面或其它页面。`)    
}





// =============聚合==================================

/**
 * 聚合查询几天中用户进出场(1为当天，2为当天+昨天)
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.findUserInOut = async function(req,res,next) {
    let d = parseInt(req.body.d || 1);
    console.log(`用户查询前${d}天的进出场。`);
    let agg = SCInOut.aggregate([
        {$match: {Clock: {
            $gt: new Date(
                new Date().setHours(0,0,0,0) - 60*60*24*(d-1)*1000
            ),
            $lt: new Date(
                new Date()
            ) 
        }}},
        {$project: {Name:1,Clock:1,InOut:1,Spot:1}},
        {$group:{
            _id: "$Name",
            Clocks: {$push: {
                Clock: "$Clock",
                InOut: "$InOut",
                Spot: "$Spot"
            }}
        }},
        {$sort: {
            _id: 1
        }}
    ])
    let userInOutList = await agg.exec();
    // console.log('查到结果：', JSON.stringify(userInOutList,null,2));
    console.log(`用户进出场聚合结果共${userInOutList.length}个用户的记录`);
    res.render('_inOut.pug', {userInOutList});
}


module.exports.findInOutCount = async function(req,res,next) {
    console.log(`findInOutCount...`);
    let d;
    if (req.method == "GET") {
        d = parseInt(req.params.d) || 1;
    } else if (req.method == "POST") {
        d = parseInt(req.body.d) || 1;
    } else {
        console.log('req method invalid');
        return;
    }
    console.log(`用户提交表单数据d: ${d}`);

    let dayMs = 60*60*24*1000;
    let tStart = new Date(
        new Date().setHours(0,0,0,0) - (d-1) * dayMs
    );
    let tEnd = new Date(
        new Date()
    )


    let agg = SCInOut.aggregate([
            {
                $match: {
                    Clock: {
                        $gt: tStart, 
                        $lt: tEnd,
                    },
                    // Spot: spot,
                }
            },



            {
                $group: {
                    _id: "$Name",
                    InOut: {
                        $push: "$InOut"
                    },
                    // Clocks: {
                    //   $push: "$Clock"
                    // },
                    LastClock: {$max: "$Clock"}
                }
            },

            {
                $addFields: {
                    InOut: {
                        $arrayToObject: {
                            $map: {
                            input: {
                                $setUnion: "$InOut"
                            },
                            as: "j",
                            in: {
                                k: "$$j",
                                v: {
                                $size: {
                                    $filter: {
                                    input: "$InOut",
                                    cond: {
                                        $eq: [
                                        "$$this",
                                        "$$j"
                                        ]
                                    }
                                    }
                                }
                                }
                            }
                            }
                        }
                    }
                }
            },  

            {
                $addFields: {
                    countIn: "$InOut.in",
                    countOut: "$InOut.out"
                }
            },

            {
                $project: {
                    InOut: 0
                }
            },

            {
                $sort: {
                    _id: 1
                }
            },


    ])


    let userInOutCountList = await agg.exec();
            console.log('result:', JSON.stringify(userInOutCountList[0],null,5))
            console.log(`共输出${userInOutCountList.length}个列表元素`)    

    res.render('_inOutCount.pug',{userInOutCountList})



}

/**
 * 聚合报告，某场所
 * 用户提交：spot, days
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * router.get('/find/record/spotReport/:spot/:days', c.spotReport);
 */
module.exports.spotReport = async function(req,res,next) {
    console.log('req.body:', req.body);
    console.log('req.params:', req.params);
    console.log('req.method:', req.method)
    let spot, days;
    if (req.method == 'GET') {
        spot = req.params.spot;
        days = parseInt(req.params.days);
    } else {
        spot = req.body.spot;
        days = parseInt(req.body.days);
    }
    console.log(`客户端表单提交: spot: ${spot}, days: ${days}`)

    days = days || 1;

    let dayMs = 60*60*24*1000;

    // 当天零时
    let startOfToday = new Date(
        new Date().setHours(0,0,0,0)
    )
    let tEnd = new Date();
    // 1为当天，2为当天+昨天
    let tStart = new Date(
        startOfToday - (days-1)*dayMs
    );
    console.log('开始：', tStart);
    console.log('结束：', tEnd)

    let agg = SCRecord.aggregate([
        {
            $match: {
                DateCreated: {
                    $gt: tStart, 
                    $lt: tEnd,
                },
                Spot: spot,
            }
        },


        {
            $unwind: {
                path: "$List",
                preserveNullAndEmptyArrays:true
            }
        },
    
        {
            $sort: {
                Role: 1    
            }
        },
    
        {
            $addFields: {
                Item: "$List.Item", Status: "$List.Status",
            }
        },
         {
            $project: {
                List: 0
            }
         },
  
        // 按部门汇总：不合格项列表，状态列表，文件列表
        {
            $group: {
                _id: "$Role",            
                nokItems: {
                    $push: {
                        $cond: {if: {$eq: ["$Status" ,"NOK"  ]},then:"$Item", else: "$$REMOVE" }
                    }
                },
                Status: {$push: "$Status"},
                Files: {$push: "$Files"}, //增加文件汇总
                Text: {$push: "$Text"}, // 增加说明文字
    

            }
        },

        //增加以下：文件汇总去重    
        {
            $project: {
                nokItems:1,
                Status: 1,
                Text: 1,
                Files: {
                    $reduce: {
                        input: "$Files",
                        initialValue: [],
                        in: { $setUnion: ["$$value", "$$this"] },
                    },
                },

            }
        },

        // 汇总合格与不合格总数
        {$addFields: {
            Status: {
              $arrayToObject: {
                $map: {
                  input: {
                    $setUnion: "$Status"
                  },
                  as: "j",
                  in: {
                    k: "$$j",
                    v: {
                      $size: {
                        $filter: {
                          input: "$Status",
                          cond: {
                            $eq: [
                              "$$this",
                              "$$j"
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },  

        // 汇总不合格列表中重复的次数
        {$addFields: {
            nokItems: {
                $arrayToObject: {
                $map: {
                    input: {
                    $setUnion: "$nokItems"
                    },
                    as: "j",
                    in: {
                    k: "$$j",
                    v: {
                        $size: {
                        $filter: {
                            input: "$nokItems",
                            cond: {
                            $eq: [
                                "$$this",
                                "$$j"
                            ]
                            }
                        }
                        }
                    }
                    }
                }
                }
            }
            }
        },  
        
        

        {
            $addFields: {Role: "$_id"}
        },
        {
            $project: {
                _id:0
            }
        },
        {
            $sort: {
                Role: 1
            }
        }


       
    ]);



    if (!spot) {
        delete agg.pipeline()[0]['$match']['Spot'];   // 场所空时：所有场所
    }
    
    console.log('agg.pipeline:', agg.pipeline()[0]);  // 检查过滤条件

    let result =  await agg.exec();

    console.log('结果:', JSON.stringify(result,null,5));
    console.log(`共输出${result.length}个列表元素`);
    // res.json(result)  

    //区分“提交”与“下载”
    if (req.params.type == "display") {
        console.log(`用户点击"提交"按钮。`);
        res.render('_spotReport.pug',{data: result,spot})        
    } else if (req.params.type == "download") {
        console.log(`用户点击"下载"按钮。`);
        let DATA = result;
        let options = {
            Project: "上海大歌剧院",
            Spot: spot,
            Description: "要重点关注的点（需要完善...）",
        };
        console.log("DATA:", DATA);
        console.log('options:', options)
        utilMakeDoc(DATA,options).then(
            buffer => {
                // 设置下载文件名
                res.set("Content-Type","application/msword");
                res.set("Content-Disposition", "attachment;filename=report.docx");
                res.send(buffer)
            }
        )

    }

}

// ========================================================


const {utilMakeDoc} = require('./utilMakeDoc.js');
const { url } = require('inspector');
const { save } = require('pdfkit');
/**
 * Just a test page checking whether url works
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.test = function(req,res,next){
    console.log('req:', req);

    res.json( req.body)

}

/**
 * 首页，菜单
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.home = async function(req,res,next) {
    res.render(`home.pug`)
}

/**
 * Spot checking activities
 */


/**
 * Return check form when people scan qr code
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectSpot = async function (req,res,next) {
    res.send(`Page destination of GET /:project/:spot`);
}

/**
 * Handle ajax request when qr code scanned
 * record person arrival of the qr spot
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectSpotArrival = async function(req,res,next) {
    res.send(`Page destination of POST /:project/:spot/arrival`);
}

/**
 * Handle submit form data of checklist
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectSpotSubmit = async function(req,res,next) {
    res.send(`Page destination of POST /:project/:spot/submit`);
}



/**
 * Admin main menu
 */

module.exports.admin = async function(req,res,next) {
    res.render('admin.pug')
}

/**
 * 管理员添加用户表单
 */
module.exports.adminUserAddGet = async function(req,res,next) {
    res.render('register.pug')
}


/**
 * 管理员添加用户
 */
module.exports.adminUserAddPost = async function(req,res,next) {
    let {Name, Cellphone,Role} = req.body;
    console.log(`Name: ${Name}, Cellphone: ${Cellphone}, Role: ${Role}`);
    let user = new SCUser({Name, Cellphone,Role});
    user = await user.save()
    console.log(`New SCUser saved.`, user);
    res.json({user})
}

module.exports.adminUserFind = async function(req,res,next) {
    if (req.method == 'GET') {
        res.render('adminUserFind.pug');   
    } else {
        let name = req.body.name;
        let cellphone = req.body.cellphone;
        let query = {}
        if ( name ) { query.Name = name }
        if ( cellphone ) { query.Cellphone = cellphone }
        let users =  await SCUser.find(query);
        console.log(`found users: ${users}`)
        // res.json(users)
        res.render('adminUserFindList.pug', {docs:users});
    }
     
}


module.exports.adminUserEditId = async function(req,res,next) {
    if (req.method == 'GET' ) {
        let id = req.params.id;
        let user = await SCUser.findById(id)
        // res.json(user)
        res.render("adminUserEdit.pug",{user});
    } else {
        let id = req.params.id;
        let name = req.body.name;
        let cellphone = req.body.cellphone;
        let role = req.body.role;
        let user = await SCUser.findById(id);
        user.Name = name;
        user.Cellphone = cellphone;
        user.Role = role;
        await user.save();
        res.send(`用户信息已更新为: ${user}`)
    }   
}

module.exports.adminUserDeleteId = async function(req,res,next) {
    let id = req.params.id;
    let user = await SCUser.findById(id)
    await SCUser.findByIdAndDelete(id);
    res.send(`已删除用户：${user}`)
}



/**
 * 二维码，创建，下载
 */

module.exports.qr = async function(req,res,next) {
    let type = req.params.type;
    console.log('type:', type);

    let QRCode = require('qrcode');
    // console.log('QRCode:', QRCode);
    if (req.method == "GET") {
        console.log('GET QR')
        res.render('qr.pug')
    } else if (req.method == "POST") {
        console.log('POST QR')
        let project = req.body.project;
        let spot = req.body.spot;
        console.log(`project: ${project}, spot: ${spot}`)    
        // let qrIn = `http://8.134.79.194:3000/spotCheck/${project}/${spot}/in`;
        // let qrOut = `http://8.134.79.194:3000/spotCheck/${project}/${spot}/out`;
        let qrIn = `http://8.134.79.194:3000/spotCheck/${encodeURI(project)}/${encodeURI(spot)}/in`;
        let qrOut = `http://8.134.79.194:3000/spotCheck/${encodeURI(project)}/${encodeURI(spot)}/out`;
        console.log(`入场URL: ${qrIn}\n出场URL: ${qrOut}`);

        if (type == "display") {
            console.log("用户提交显示在页面");
            QRCode.toDataURL(qrIn,(err,qrInCodeImage)=>{
                QRCode.toDataURL(qrOut,{},(err,qrOutCodeImage)=>{        
                        console.log(`project: ${project}, spot: ${spot}`)     
                        res.send(`
                            <h1> 进出场二维码 </h1>
                            <h4> 入场二维码 </h1>
                            <img src="${qrInCodeImage}" width="300" height="300" alt="入场二维码">                            
                            <p> ${project} | ${spot} </p>
                            <br><br><br>
                            <h4> 出场二维码 </h1>
                            <img src="${qrOutCodeImage}"  width="300" height="300" alt="出场二维码">
                            <p> ${project} | ${spot} </p>
                        `)
                })
            });
        } else if (type == "download") {
            console.log("用户提交下载QR文件");
            // console.log('QRCode.toBuffer:', QRCode.toBuffer)
            QRCode.toBuffer(qrIn, (err,inBuffer)=>{
                QRCode.toBuffer(qrOut, (err,outBuffer)=>{
                    let options = {
                        project,
                        spot,
                        inBuffer,
                        outBuffer
                    };
                    let DATA = {};



                    require('./utilMakeQrDoc.js').utilMakeQrDoc(DATA,options).then(
                        buffer => {
                            // 设置下载文件名
                            res.set("Content-Type","application/msword");
                            res.set("Content-Disposition", "attachment;filename=report.docx");
                            res.send(buffer)
                        }
                    )
                })

            })
        }



    } else {
        console.log(`提交既不是GET，也不是POST`)
    }

};


/**
 * 创建新场所
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.spotAdd = async function(req,res,next) {
    if (req.method == 'GET') {
        console.log(`用户提交GET，显示场所添加表单`);
        res.render('spotAdd.pug')

    } else if (req.method == "POST") {
        console.log('用户提交POST，提交场所表单待处理')
        let Project = req.body.project;
        let Spot = req.body.spot;
        let checklist = req.body.checklist;
        console.log('checklist:', checklist);
        let CheckList = checklist.split('\r\n');
        console.log(`Project: ${Project}\nSpot:${Spot}`);
        console.log(`CheckList:`, CheckList);

        let newSCSpot = new SCSpot({
            Project,
            Spot,
            CheckList
        })
        newSCSpot =  await newSCSpot.save();
        console.log(`已保存：${newSCSpot}`)
        res.json(newSCSpot);
    }
};

/**
 * 查找场所，显示结果列表
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.spotFind = async function(req,res,next) {
    if (req.method == "GET") {
        console.log(`用户提交查找场所，返回填写表单`);
        res.render('spotFindForm.pug');

    } else if (req.method == "POST") {
        console.log(`用户提交了表单数据，处理查找`)
        let project = req.body.project;
        let spot = req.body.spot;
        console.log(`用户提交查询数据：project:${project}, spot: ${spot}`)
        let search = {};
        if (project) {search[Project] = project;}
        if (spot) { search[Spot] = spot;}
        let spots = await SCSpot.find(search).sort({Spot:1});
        console.log(`找到 ${spots.length} 个场所,第一个是: ${spots[0]}`);
        res.render("spotFindList.pug", {docs: spots});
    }
};

/**
 * 显示一个场所 基于_id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.spotShowId = async function(req,res,next) {
    let _id = req.params.id;
    console.log('_id: ', _id)
    let scSpot = await SCSpot.findById(_id);
    res.render('spotId.pug', {scSpot,action:'show'})
};

/**
 * 编辑场所
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.spotEditId = async function(req,res,next) {
    if (req.method == "GET") {
        let _id = req.params.id;
        let scSpot = await SCSpot.findById(_id);
        console.log(`根据指定的场所进行编辑，scSpot:`,scSpot)
        res.render('spotId.pug', {scSpot, action:'edit'})
    } else if (req.method == "POST") {
        let {_id, spot, project,description,checklist} = req.body;
        console.log(`用户提交的数据：`, req.body);
        let scSpot =  await SCSpot.findById(_id);
        scSpot.Spot = spot;
        scSpot.Project = project;
        scSpot.Description = description;
        scSpot.CheckList = checklist;
        let savedSpot =  await scSpot.save();
        console.log('savedSpot:', savedSpot);
        res.json(savedSpot);
    }
};

/**
 * 克隆场所（新建）
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.spotCloneId = async function(req,res,next) {
    let _id = req.params.id;
    console.log(`克隆场所_id:${_id}`);
    let scSpot = await SCSpot.findById(_id);
    console.log(`克隆采用的场所spot:`, scSpot)
    res.render('spotId.pug', {scSpot,action:"clone"})
};







/**
 * User self manage: register, update
 */

module.exports.projectUserRegisterGet = async function(req,res,next) {
    res.render('userRegister.pug');
    // res.send(`Page destination of GET /:project/user/register `);
}

/**
 * user self register
 * db: Name, Cellphone, Password, fp
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.projectUserRegisterPost = async function(req,res,next) {
    let {Name, Cellphone, Password, Fp} = req.body;
    console.log(`Form submitted with Name: ${Name}, Cellphone: ${Cellphone}, Password: ${Password}, Fp: ${Fp}`);
    let user = new SCUser({Name, Cellphone, Password, Fps: [Fp]})
    await user.save();
    console.log(`user created in db: ${user}`)
    res.send(`你好：${user.Name}, 手机号：${user.Cellphone}, 你已成功注册！`)
    // res.send(`Page destination of POST /:project/user/register `);
}


module.exports.projectUserIdUpdateGet = async function(req,res,next) {
    res.render('userUpdate.pug')
    // res.send(`Page destination of GET /:project/user/:id/update `);
}

module.exports.projectUserIdUpdatePost = async function(req,res,next) {
    console.log('req.body:', req.body);
    let {Text, Fp} = req.body;
    let user;
    console.log(`Client submitted Text: ${Text}, fp: ${Fp}`);
    // Text: Name or Cellphone
    if (Text.match(/^\d{5,11}$/i)) {
        user = await SCUser.findOne({Cellphone:Text});
    } else {
        user = await SCUser.findOne({Name: Text})
    }
    // after db query
    if (!user) {
        console.log(`user not found per client's input.`);
        res.send(`你输入的姓名或手机号还没有注册。`);
    } else {
        console.log(`found user: ${user}`);
        user.Fps.push(Fp);
        await user.save();
        console.log(`user saved with added Fp: ${Fp}`);
        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Surrogate-Control": "no-store"
        });
        res.send(
            `你好，系统认为你是${user["Name"]}, <br>
            手机号为: ${user["Cellphone"]} <br>
            如果不对，请点击<a href="/spotCheck/project/user/id/update"><button>我要纠正！</button></a>`
        )
    }
    // res.send(`Page destination of POST /:project/user/:id/update `);
}

/**
 * 用户自己的巡视记录列表
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.userRecordList = async function(req,res,next) {
    console.log('userRecordList...');
    let cellphone = req.params.cellphone;
    let scRecords = await SCRecord.find({Cellphone:cellphone});
    console.log(`found records for ${cellphone}: ${(await scRecords).length}个记录,其中第一个是：`, scRecords[0]);
    res.render('_recordsUser.pug', {scRecords});
}

/**
 * 用户自己的进出场记录列表
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.userInOutList = async function(req,res,next) {
    console.log('userInOutList...');
    let cellphone = req.params.cellphone;
    let scInOuts = await SCInOut.find({Cellphone:cellphone});
    console.log(`找到${scInOuts.length}个用户${cellphone}的进出场记录，其中最后一条是：`, scInOuts[scInOuts.length-1])
    res.render('_inOutsUser.pug',{scInOuts})
}


