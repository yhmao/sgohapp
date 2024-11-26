const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const FOLDER = "/Users/yhmao/sgoh/vba";

let jsonFiles = _.filter(fs.readdirSync(FOLDER),function(filename){ return path.extname(filename) == '.json' &&  !filename.startsWith("~")}  ) 

console.log('jsonFiles: ', jsonFiles)

function checkJsonFiles(){
    for (let i = 0 ; i<jsonFiles.length; i++) {
        let docs = JSON.parse(fs.readFileSync(path.join(FOLDER,jsonFiles[i])));
        console.log(`${jsonFiles[i]} has ${docs.length} docs;`)
    }
}
// checkJsonFiles();

function totalDocs(){
    let count = 0;
    for (let i = 0 ; i<jsonFiles.length; i++) {
        let docs = JSON.parse(fs.readFileSync(path.join(FOLDER,jsonFiles[i])));
        console.log(`${jsonFiles[i]} has ${docs.length} docs;`)
        count = count + docs.length;
    }    
    return count;
}
console.log(`total docs: ${totalDocs()}`)


const URI = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
let Mongoose = require('mongoose').Mongoose;
let mongoose = new Mongoose();
mongoose.connect(URI);

let Schema = new mongoose.Schema({}, {strict:false});
let Docspec = mongoose.model('Docspec', Schema);


function writeToDB(){
    for (let i = 0; i < jsonFiles.length; i++){
        let docs = JSON.parse(fs.readFileSync(path.join(FOLDER, jsonFiles[i])));
        for (let j = 0 ; j < docs.length; j++){
            let doc = new Docspec(docs[j]);
            console.log(`${jsonFiles[i]}, doc[${i}]=> db:`)
            doc.save((err,doc)=>{
                if (err) { console.log(`${doc['Document']} item: ${j} err: ${err}.`)}
                else {
                    console.log(`${doc['Document']} item: ${j} saved to db.`)
                }
            })        
        }                
    }
}
    


writeToDB();