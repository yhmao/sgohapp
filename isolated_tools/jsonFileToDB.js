const fs = require('fs')

var uri, Mongoose, mongoose, modelName, Schema;
// modelName = Part

let connect = function(modelName){
    // uri = require("../uri.js");
    uri = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
    Mongoose = require('mongoose').Mongoose;
    mongoose = new Mongoose();
    mongoose.connect(uri);
    Schema = new mongoose.Schema({},{strict:false });
    var Model = mongoose.model(modelName,Schema)
    return Model;    
}

let Item = connect('Item');

var docs;
let getDocsFromJsonFile = function(path) {
    console.log(`path: ${path}`);
    docs = JSON.parse(fs.readFileSync(path));
    console.log(`docs:`, docs);
    console.log(`typeof docs : ${typeof docs}`)
    console.log('======================================');


}
// let path = `D:\\SGOH\\07.弱电\\转\\ruodian_tbwj.json`;
// getDocsFromJsonFile(path);

let saveDocsToDB = function() {
    docs.forEach((doc)=>{
        let item = new Item(doc);
        item.save(()=>{console.log('saved.')})
    })    
    console.log('ok')
}


let run = async function(path){
    getDocsFromJsonFile(path);
    saveDocsToDB();
};


// run(`ruodian_tbwj_brands.json`)
run(`ruodian_tbwj_data.json`)
// run(`wutai_tbwj.json`)


console.log('done')


