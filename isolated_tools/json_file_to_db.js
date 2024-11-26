// json file to db
// delete _id, date
// add dateCreate (now)
// add dateUpdate (now)

// laptop - ali db
let uri = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

let Mongoose = require('mongoose').Mongoose;
let mongoose = new Mongoose();
mongoose.connect(uri);
let ObjectID = mongoose.Types.ObjectId;

let Schema = new mongoose.Schema({}, {strict:false});


let normalizeDoc = function(doc){
    if (doc._id) delete doc._id;
    if (doc.date) delete doc.date;
    if (doc.Date) delete doc.Date;
    doc['dateCreated'] = Date.now();
    doc['dateUpdated'] = Date.now();
    return doc;
}

let fileToDb = function (jsonFile, Model) {
    let docs = JSON.parse(require('fs').readFileSync(jsonFile));
    console.log(`jsonFile: ${jsonFile} contains ${docs.length} documents.`);
    for (let i = 0; i < docs.length; i++) {
        let doc = docs[i];
        doc = normalizeDoc(doc);
        let document = new Model(doc);
        document.save((err,doc)=>{
            if (err) {console.log(`Error Doc[${i}]: ${err} !!!`);}
            else {console.log(`Doc[${i}] saved to db.`);}
        })
    }

}

let Item =  mongoose.model('Item', Schema)

// fileToDb("sgoh-node.docspecs.json",Item);
// fileToDb("sgoh-node.parts.json",Item);