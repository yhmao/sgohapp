
const file = `sgoh-node.items.VS.group1.json`;

let docs = JSON.parse(require('fs').readFileSync(file));

// console.log('docs:', docs)

let out = "";

for (var i=0; i<docs.length; i++) {
    // console.log(docs[i])
    let t = docs[i]['_id']['Venue'] + "  -  " + docs[i]['_id']['System'];
    // console.log(t)
    let compare = function(a,b) {
        return parseInt(a.split(' ')[0]) - parseInt(b.split(' ')[0])
    }
    let list = docs[i]['Group1'].sort(compare).join('\n')
    // console.log(list)
    out += t 
    out += '\n';
    out += list
    out += '\n\n'
}

console.log(out)