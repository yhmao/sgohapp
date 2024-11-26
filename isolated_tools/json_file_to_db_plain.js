/**
 * Read data from .json file (./) as Array
 * write each document to db.items (ali remote)
 */

// connect from laptop to ali db
let uri = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
let Mongoose = require('mongoose').Mongoose;
let mongoose = new Mongoose();
mongoose.connect(uri);

let Schema = new mongoose.Schema({}, {strict:false});

/**
 * Read documents from json file and write to db one by one
 * @param {String} jsonFile as input file with json data
 * @param {mongoose.model} Model as db Model interface
 * @returns void
 */
let fileToDb = function (jsonFile, Model) {
    let docs = JSON.parse(require('fs').readFileSync(jsonFile));
    console.log(`jsonFile: ${jsonFile} contains ${docs.length} documents.`);
    for (let i = 0; i < docs.length; i++) {
        let doc = docs[i];
        // doc = normalizeDoc(doc);
        let document = new Model(doc);
        document.save((err,doc)=>{
            if (err) {
                console.log(`Error Doc[${i}]: ${err} !!!`);
            }
            else if (!(i % 10) || i == docs.length -1) {
                console.log(`Doc[${i}] saved to db.`);
            }
            else {

            }
        })
    }

}

/**
 * Execute
 */
let Item =  mongoose.model('Item', Schema)
let jsonFile = `ruodian_tbwj_spec_dev.json`;
let Model = Item;
fileToDb(jsonFile,Model)
