/**
 * 1440-EA-SCD-X01.xlsx file json sheet
 * to 1440-EA-SCD-X01.json file
 */


const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const filepath = '/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF单独/out/1440-EA-SCD-X01.xlsx'
console.log(`Working on file: ${filepath} . `);


function wbSheetJsonToJsonFile(xlsxFile) {
    console.log(`Converting ${xlsxFile} sheet of 'json' to json file...`);
    let wb = XLSX.readFile(xlsxFile);
    let docs = XLSX.utils.sheet_to_json(wb.Sheets['json']);
    let jsonFileName = xlsxFile.split('/').pop().split('.')[0] + '.json';
    console.log(`jsonFileName: ${jsonFileName}`);
    fs.writeFileSync(jsonFileName, JSON.stringify(docs));
    console.log(`Converted and saved to file ${jsonFileName}, doc nr: ${docs.length}`);    
}

wbSheetJsonToJsonFile(filepath);
