// TP detail spec text (english only) parse to Section

const fs = require('fs');
const readline = require('readline');

//global
const inputFile = `/Users/yhmao/Desktop/1440-SE-DOC-101v2.txt`;
let sectionCount = 0;
let section = "";
let content = "";
let list = [];

// corresponding `item` db `Document` field
let Document = inputFile.split('/').pop().split('.')[0].slice(0,14) + "2"
// 1440-SE-DOC-101v2.txt => 1440-SE-DOC-102
console.log('Document:', Document)

// each line
async function processLineByLine(cb) {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay:Infinity
  });

  for await (const line of rl) {
    handleLine(line);
  }
  return cb();
}

// single line
let handleLine = function(line) {
  //let p = /^\s?\d{1,2}\.\d{1,2}\.\d{1,2} /;    // leading pattern
  let p = /^\s?[1-9]{1}[0-9]{0,1}\.\d{1,2}\ /;    // leading pattern

  // +
  if (section && !p.test(line)){
    content += line + '  ';
  }

  // find new
  if (p.test(line)) {
    // save previous
    if (section && content) {
      list.push({
        Document,
        Section:section.trim(),
        "详细规范英文":content,
        "DetailSpecE":content
      })
      sectionCount++;
    }
    // reset new
    section = line.match(p)[0];    
    content = line;
  } else {
    // do nothing
  }  
}


// cb all lines done
let final = function(){
  console.log(`Total ${sectionCount} sections parsed.`)
  // save to json file.
  fs.writeFileSync(Document+'.json', JSON.stringify(list), 'utf-8');
  console.log(`list of sections written to file: ${Document}.json.`)
}

// processLineByLine(final);

let checkJsonDocs = function() {
  let jsonFile = '1440-SE-DOC-102.json';
  let docs = JSON.parse(require('fs').readFileSync(jsonFile));
  console.log(`json docs.length: ${docs.length}`);
  let compare = function(a,b) { return parseInt(a.Section.split('.')[0]) > parseInt(b.Section.split('.')[0])}
  docs.sort(compare)

  for (let i = 0; i < docs.length; i++) {
    console.log(i, ':', docs[i].Section)
  }


}
checkJsonDocs();

// read json docs
// each doc
// update Item

let updateDBItemPerJsonDoc = function(){
  let jsonFile = '1440-SE-DOC-102.json';
  let docs = JSON.parse(require('fs').readFileSync(jsonFile));
  console.log(`json docs.length: ${docs.length}`);
  
  
  let Item = require('../app/item/database');
  console.log('Item:', Item)
  
  for (let i = 0; i < docs.length; i++) {
    let s = docs[i].Section.split('.').slice(0,2).join('.');
    console.log('s:',s)
    console.log('docs[i].Section:', docs[i].Section.trim())
    Item.findOne({
      Cat:"舞台TP",
      // Document: "1440-SE-DOC-102",
      Section:s
    },(err,doc)=>{
      if (err) {
        console.log('err:', err);
      } else{
        console.log('doc._id:', doc._id)
        // console.log(`Section: ${doc.Section}, _id: ${doc._id}`)
      }
      
    })
  }
}
// updateDBItemPerJsonDoc();


let test = function(){
  let Item = require('../app/item/database');
  console.log('Item:', Item)
  Item.findOne({Section: "4.14.15"},(err,doc)=>{
    console.log('found doc:', doc)
  })
}
