// let uri = "mongodb://localhost:27017/sgoh-node";

// laptop - ali db
let uri = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

let Mongoose = require('mongoose').Mongoose;
let mongoose = new Mongoose();
mongoose.connect(uri);

let Schema = new mongoose.Schema({}, {strict:false});
let Tp =  mongoose.model('Tp', Schema)

let path = '1440-SE-DOC-102.json';
let docs = JSON.parse(require('fs').readFileSync(path));

console.log('docs[0]:', docs[0]);

docs.forEach(doc=>{
    let tp = new Tp(doc);
    tp.save(()=>{
        console.log('one doc saved to db.');
    })
})