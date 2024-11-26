const fs = require('fs');
const XLSX = require('xlsx');

let path = '/Users/yhmao/sgoh/2022.11.14TP舞台工程招标文件/TP 舞台工程招标文件 PDF 20220630/SE 舞台机械/1440-SE-DOC-102.xlsm';
console.log('path:', path);

let out = '1440-SE-DOC-102.json';

// let wb = XLSX.readFile(path);
// console.log('wb:', wb);
// let sheet = wb.heets['test'];
// console.log('sheet',sheet);


let records = XLSX.utils.sheet_to_json(XLSX.readFile(path).Sheets['test']);
console.log('records:', records);

fs.writeFileSync(out, JSON.stringify(records));
console.log('written to json file');
