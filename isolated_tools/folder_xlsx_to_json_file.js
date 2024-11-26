

const fs = require('fs')
const path = require('path')
const _ = require('underscore')
const XLSX = require('xlsx')
const folder = "/Users/yhmao/sgoh/vba";

let files = fs.readdirSync(folder)

// filter xlsx
filesXLSX = _.filter(files,function(name){return name.split(".")[1] == "xlsx" &&  !name.startsWith('~')})
filesJSON = _.filter(files, function(name){return name.split(".")[1] == "json"})


console.log("json files: ", filesJSON)
console.log('=======');
console.log("xlsx files: ", filesXLSX)

function removeAllJsonFiles(folder){
    let allFiles = fs.readdirSync(folder);
    let filesJson = _.filter(allFiles,function(filename){return filename.split('.')[1] == 'json';})
    console.log('json files to be deleted: ', filesJson);
    filesJson.forEach((jsonfile)=>{
        fs.unlinkSync(path.join(folder,jsonfile))
        console.log(`deleted ${jsonfile} done.`)
    })

}   
// removeAllJsonFiles(folder);

function wbSheetToJson(folder, filename){
    console.log(`converting ${filename} sheet of 'json' to json file...`);
    let fileSource = path.join(folder,filename)
    let wb = XLSX.readFile(fileSource)
    let docs = XLSX.utils.sheet_to_json(wb.Sheets["json"])
    let fJson = path.join(folder, filename.split(".")[0] + '.json')
    console.log('filename for json:', fJson)
    fs.writeFileSync(fJson, JSON.stringify(docs))
    console.log(`converted: ${filename}, doc nr: ${docs.length}`)
}

function convertAllWookbookJsonSheetToJsonFile(){
    for (var i = 0; i<filesXLSX.length; i++) {
        wbSheetToJson(folder,filesXLSX[i])
    }
}

convertAllWookbookJsonSheetToJsonFile();




