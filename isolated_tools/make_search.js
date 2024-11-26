const db = require('..\/app\/part\/database.js');

let getCollectionKeys = async function() {

    // # Using aggregate() method 
    // let docs = await db.Part.aggregate([
    //     { $project: { keys: { $objectToArray: "$$ROOT" } } },
    //     { $group: { _id: "$keys.k" } }
    // ]).exec();
    // docs.forEach(function(doc) { console.log('----------');console.log(doc._id); });


    let keys =  await db.Part.find({})
    keys = keys.map((x) => Object.keys(x)).reduce((a, e) => {for (el of e) { if(!a.includes(el)) { a.push(el) }  }; return a}, []).sort((a, b) => a.toLowerCase() > b.toLowerCase()).join(", ")
    console.log('keys:', keys)
    return keys;
}


let keysOfPart = (async ()=>{
    let keys = await getCollectionKeys();
    return keys;
})();

console.log('keysOfPart:', keysOfPart);


let doc = {"序号":1,"设备材料名称":"壁挂双鉴探测器","设备型号规格":"ISC-BDL2-WP12G-CHI","单位":"套","数量":48,"品牌":"博世","制造厂商":"博世（珠海）安保系统有限公司","产地":"中国","综合单价":410.14,"寿命":"满足招标要求","定货期（天）":7,"运送期（天）":7,"到工地时间":"提前7天进场","子系统":"一 undefined","子子类":"","专业":"弱电","文件名":"弱电投标文件设备材料规格表","date":1699345541676,"file":"弱电投标文件设备材料规格表","item":"壁挂双鉴探测器","description":"ISC-BDL2-WP12G-CHI","quantity":48,"price":410.14,"cost":19686.72,"profession":"弱电","subSystem":"一 undefined","subSubSystem":"","supplier":"博世（珠海）安保系统有限公司"};

let s = "博世 珠海 -双鉴 +安保 ";


let getKeysEnFromDoc = function(doc){
    let keysEn = [];
    Object.keys(doc).forEach(k=>{
        if (/\w+/i.test(k)) keysEn.push(k);
    });
    return keysEn;
}
// let keysEn = getKeysEnFromDoc(doc);
// console.log('keysEn',keysEn);

let searchStringToWordList = function(string) {
    return string.trim().split(/\s+/);
};
// let wordList = searchStringToWordList(s);
// console.log('wordList:', wordList);

let makeOrList = function(keys, word){
    console.log('word:', word);
    word = word.replace(/\+/,'').replace(/-/,'')
    console.log('word:', word);
    let orList = [];
    keys.forEach((k)=>{
        let o = {};
        let r = new RegExp(word,'i');
        o[k] = r;
        orList.push(o);
    })
    console.log('orList:',orList);
    return orList;
}

let makeAndList = function(wordList) {
    let andList = [];
    wordList.forEach((w)=>{
        let orList = makeOrList(keysEn,w);
        andList.push({$or:orList});
    })
    console.log('andList:', andList);
    return andList;
}
// let andList = makeAndList(wordList);







