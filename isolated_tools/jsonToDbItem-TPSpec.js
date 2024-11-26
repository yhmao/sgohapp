const fs = require('fs')

let jsonFile = `/Users/yhmao/ex/stage/舞台TP中文规范.json`

let data = fs.readFileSync(jsonFile);
// console.log(JSON.stringify(JSON.parse(data),null,2))
// console.log(JSON.parse(data).length)

let items = JSON.parse(data)
// console.log(items)
console.log(items.length)


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

for (let i = 0; i< items.length; i++){
    // console.log(i)
    // console.log(`ref: ${items[i]['refNo']}`);

    let section = items[i]['refNo']

    let docs = Item.find({
        Cat:"舞台TP",
        "Document": "1440-SE-DOC-102",
        "Section":section,
        },
    
    
        (err,docs)=>{
            console.log(`\n-------------\nNr.${i}\n`)
            console.log(`section: ${section}`);

            // console.log('found docs:', docs)
            console.log('number of docs: ', docs.length)
            if (docs.length == 0) {
                console.log(items[i])
            }
        }
    )





}

