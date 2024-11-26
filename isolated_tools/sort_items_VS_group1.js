const fs = require('fs');
const path = require('path');

console.log(__dirname)

let f = './sgoh-node.items.VS.group1.json';
let stream = fs.readFileSync(f)
let docs = JSON.parse(fs.readFileSync(f))
let newDocs = []

for (let i = 0; i<docs.length; i++) {
    let doc = docs[i];
    doc.Group1 = doc.Group1.sort()
    newDocs.push(doc)
}

console.log('newDocs:', newDocs)

