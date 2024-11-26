const fs = require('fs')

var uri, Mongoose, mongoose, modelName, Schema;
// modelName = Part


let connect = function(modelName){
    // uri = require("../uri.js");
    uri = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
    Mongoose = require('mongoose').Mongoose;
    mongoose = new Mongoose();
    mongoose.set('strictQuery',true);
    mongoose.connect(uri);
    Schema = new mongoose.Schema({},{strict:false });
    var Model = mongoose.model(modelName,Schema);    
    return Model;    
}

let Docspec = connect('Docspec');
let Part = connect('Part');
let count = 0
var allKeys = new Set();


let cb = function(err,docs){
    docs.forEach(doc => {
        console.log(doc['Document'],count);
        count ++;
        for (k in doc) {allKeys.add(k); console.log(allKeys) }      
    });
    for (k in allKeys) console.log(k)
}

let cb2 = function(err,doc){
    console.log('doc:', doc)
    for (let k in doc) console.log(k)
}
// Docspec.findOne({}, cb2)


// Docspec.count((err,nr)=>{
//     console.log(`Total ${nr} docs.`)
// })
// Docspec.countDocuments()

function getAllKeys(Model) {
    Model.aggregate([
        // {"$match": {"Document":"1440-PL-DOC-102"}}
        { "$project": {
          "data": { "$objectToArray": "$$ROOT" }
        }},
        { "$project": { "data": "$data.k" }},
        { "$unwind": "$data" },
        { "$group": {
          "_id": null,
          "keys": { "$addToSet": "$data" }
        }}
      ]).exec((err,docs)=>{
            console.log(`\n${Model.modelName}, all keys: \n${docs[0].keys.sort().join('\n')}\n`)
      })
        
}

getAllKeys(Part);
getAllKeys(Docspec);


function getOne(){
Docspec.findOne((err, doc)=>{
    console.log("FindOne: ", doc)
})    
}

// getAllKeys();
// getOne();


function agg1(){
    Docspec.aggregate([
        // {$match: {"Document": /PL/ig}},
        
        {$project: {"id": "$Document","Ref":1,"Venue":1, "_id":0}},
        // {$skip: 800},
        // {$limit:10}
        // {$group:{_id:"$id",countDocuments:{$sum:1}}}
        {$group: {_id: "$id", Venue: {$push: "$id"}}}
        // {$match: {$exist:{"CAPACITY":1}}},
    ]).exec((err,docs)=>{
        
        if (err) {console.log(`err: ${err}`)}
        console.log("Docs:", docs)
        console.log(`Found ${docs.length} docs.`);
    })    
}



async function checkItemECnoItem(){
    let onlyEC =  await Docspec.find({'$and': [
        {ItemE: {'$exists': true}},
        {ItemC: {'$exists': true}},
        {Item: {'$exists': false}}
    ] }).exec()
    console.log(`Found ${onlyEC.length} document has ItemE,ItemC, but not Item`)
}

// checkItemECnoItem();

let checkWutaiTbwjJsonFile = function(jsonFile){
    let readStream = fs.readFileSync(jsonFile);
    let docs = JSON.parse(readStream);
    // console.log('docs[0]:',docs[0]);
    console.log(`\n${jsonFile} : contains ${docs.length} parts.`);    // 1869
}
checkWutaiTbwjJsonFile('wutai_tbwj.json');
checkWutaiTbwjJsonFile('ruodian_tbwj_brands.json');
checkWutaiTbwjJsonFile('ruodian_tbwj_data.json');
checkWutaiTbwjJsonFile('sgoh-node.docspecs.json');
checkWutaiTbwjJsonFile('sgoh-node.parts.json');

let checkPartDB = async function(){
    let nrOfPart = await Part.count()
    console.log(`${nrOfPart} part found in db Part.`);  //2942
}
// checkPartDB();


