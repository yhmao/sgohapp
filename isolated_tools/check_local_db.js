// let uri = "mongodb://localhost:27017/sgoh-node";

// laptop - ali db
let uri = "mongodb://admin:Flzx3000c@8.134.79.194:27017/sgoh-node?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

let Mongoose = require('mongoose').Mongoose;
let mongoose = new Mongoose();
mongoose.connect(uri);

let Schema = new mongoose.Schema({}, {strict:false});
let Tp =  mongoose.model('Tp', Schema)

function checkOne() {
    Tp.findOne({}, (err,docs)=>{
        if (err) {console.log('err')}
        if (docs) {console.log('docs:', docs)}
    })    
}


function log(msg) {
    console.log("\n\n\n\nLogging out result: \n\n", msg);
}


let r = Tp.find({});
// log(r)
r.exec().then(doc=>log(doc.length))






