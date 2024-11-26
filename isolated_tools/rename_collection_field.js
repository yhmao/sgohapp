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
    var Model = mongoose.model(modelName,Schema)
    return Model;    
}

let Docspec = connect('Docspec');

//////////////////////////////////////////////////
function count(){
    Docspec.countDocuments((err,count)=>{
        console.log(`Collection total: ${count}`);
    })
}
count()

function getAllKeys() {
    Docspec.aggregate([
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
      ]).exec((err,docs)=>{console.log("Collection all fields: ", docs[0].keys.sort())})
}
getAllKeys();
//////////////////////////////////////////////////

let name = "Venue"
let q = {};
q[name] = {$exists:true}
let cb = function(err,result){
    if (err) console.log(`Error: ${err}`);
    else {
        console.log(`CountDocument with field "${name}" Result: ${result}`)
    }
}
Docspec.countDocuments(q,cb)

function renameField(){
    let update1 = {$rename:{'ITEM':'Item'}}
    Docspec.updateMany({},update1,(err,result)=>{
        console.log(`updateMany(renameField) err: ${err}`)
        console.log('updateMany(renameField) result:', result)
    })
}
renameField()


















