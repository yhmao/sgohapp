const fs = require('fs');
const XLSX = require('xlsx');

let path = 'D:\\SGOH\\07.弱电\\转\\弱电投标文件.xlsx';


// 弱电投标文件-主要设备和材料品牌表
const wb = XLSX.readFile(path);
const sheets = wb.SheetNames;
var docs = [];



let checkEachSheet = function(){
    let wb = XLSX.readFile(path);
    let sheets = wb.SheetNames;
    console.log('Sheets number:', sheets.length)
    console.log('Sheets:', sheets);
}
checkEachSheet();

let handleSheetMainBrands = function() {
    let records = XLSX.utils.sheet_to_json(wb.Sheets['主要设备和材料品牌表']);
    console.log(`valid records showed above for sheet :   ${records.length}`);

    console.log('records length:',records.length);

    console.log(typeof records)

    console.log('docs:', docs)
    docs = docs.concat(records); 

    docs.forEach((doc)=>{
        doc['文件名'] = '弱电投标文件-主要设备和材料品牌表';
        doc['专业'] = '弱电';

        // common in EN
        doc['date'] = Date.now();
        doc['file'] = '弱电投标文件-主要设备和材料品牌表';
        doc['item'] = doc['设备材料名称'] + ' - ' + doc['设备材料名称-小类'];
        doc['description'] = '建议品牌：' + doc['招标建议品牌-参照或相当于'] + '; ' + doc['拟采用品牌规格型号制造厂商和产地'];
         
    })



}



let run = function(){
    handleSheetMainBrands();
    console.log(docs)
    console.log('docs.length:', docs.length);  
    fs.writeFileSync('ruodian_tbwj_brands.json',JSON.stringify(docs));  
}

let checkOutputFile = function() {
    let out = fs.readFileSync('ruodian_tbwj_brands.json')
    out1 = JSON.parse(out)
    console.log(out1) 
    console.log(`typeof output json.parsed: ${typeof out1}`);
    console.log(`Nr. of records: ${out1.length}`);
}

run();  
checkOutputFile();

