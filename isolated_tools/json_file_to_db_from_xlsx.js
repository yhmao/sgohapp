
/**
 * json file in current folder to db
 * json => docs
 * doc => normalize (more keys)
 * doc.save()
 */

// laptop - ali db
let uri = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

let Mongoose = require('mongoose').Mongoose;
let mongoose = new Mongoose();
mongoose.connect(uri);
let ObjectID = mongoose.Types.ObjectId;

let Schema = new mongoose.Schema({}, {strict:false});
let Item =  mongoose.model('Item', Schema)

let normalizeDoc = function(doc){
    doc['dateCreated'] = Date.now();
    doc['dateUpdated'] = Date.now();
    doc['Document'] = doc['文件'];
    doc['Venue'] = doc['场所'];
    doc['System'] = doc['系统'];
    doc['Name'] = doc['位置'];
    doc['Load'] = doc['预估最大差异需求KVA'];
    doc['Cat'] = "舞台电负荷";
    return doc;
}

let makeText = function(doc) {
    let Text = '';
    Object.keys(doc).forEach((key)=>{
        if (doc[key]) {
            Text += `[${key}]: ${doc[key]},  `;
        }
    })
    return Text;
}

let completeDoc = function(doc) {
    doc['Text'] = makeText(doc);
    doc = normalizeDoc(doc);
    return doc;
}


let fileToDb = function (jsonFile, Model) {
    let docs = JSON.parse(require('fs').readFileSync(jsonFile));
    console.log(`jsonFile: ${jsonFile} contains ${docs.length} documents.`);
    for (let i = 0; i < docs.length; i++) {
        let doc = docs[i];
        doc = completeDoc(doc);
        let document = new Model(doc);
        document.save((err,doc)=>{
            if (err) {console.log(`Error Doc[${i}]: ${err} !!!`);}
            else {console.log(`Doc[${i}] saved to db.`);}
        })
    }

}

fileToDb("1440-EA-SCD-X01.json",Item)


