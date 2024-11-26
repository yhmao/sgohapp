// tbwj: 投标文件

const fs = require('fs');
const XLSX = require('xlsx');

let path = 'D:\\SGOH\\07.弱电\\转\\弱电投标文件.xlsx';
path = `/Users/yhmao/sgoh/SGOH/07.弱电/转/弱电投标文件.xlsx`

const wb = XLSX.readFile(path);
const sheets = wb.SheetNames;
var docs = [];
console.log('\n\n\n\n')


let checkEachSheet = function(){
    let wb = XLSX.readFile(path);
    let sheets = wb.SheetNames;
    console.log('Sheets number:', sheets.length)
    console.log('Sheets:', sheets);
}
// checkEachSheet();

let handleOneSheet = function(index=0) {
    console.log(`Sheet: "${sheets[index]}"`)
    let records = XLSX.utils.sheet_to_json(wb.Sheets[sheets[index]]);
    console.log(`Total lines: ${records.length}`)    
    
    let cleanRecords = function() {
        let cleanedRecords = [];
        console.log('cleaning...')
        let cat = '';
        let cat2 = '';

        let handleRow = function(row) {
            if (typeof row['序号'] === 'number' ){
                // console.log('number');
                row['子系统'] = cat;
                row['子子类'] = cat2;   
                row['专业'] = '弱电';
                row['文件名'] = '弱电投标文件设备材料规格表';

                // common in EN
                row['date'] = Date.now();
                row['file'] = '弱电投标文件设备材料规格表';
                row['item'] = row['设备材料名称'];
                row['description'] = row['设备型号规格']
                row['quantity'] = parseFloat(row['数量']);
                row['price'] = parseFloat(row['综合单价']);
                row['cost'] = parseFloat(row['综合单价']) * parseFloat(row['数量']);
                row['profession'] = '弱电';
                row['subSystem'] = cat;
                row['subSubSystem'] = cat2;
                row['supplier'] = row['制造厂商'];                

                return row; 
            } else if ( typeof row['序号'] === 'string' && "一二三四五六七八九十廿".indexOf((row['序号'].slice(0,1)).toString()) >= 0) {
                // console.log('子系统')
                cat = row['序号'] + ' ' + row['设备材料名称'];
                console.log('cat:', cat)
                return;
            } else if ( typeof row['序号'] === 'string' && row['序号'].slice(0,1) === 'B' ) {
                // console.log('子子类')
                cat2 = row['序号'] + ' ' + row['设备材料名称'];   
                console.log('cat2:', cat2)
                return;             
            } else {
                console.log(`something wrong with :`, row);
                return;
            }
        }


        for (let r=0; r < records.length; r++) {
            let row = records[r];    
            row =  handleRow(row);
            if(row) cleanedRecords.push(row);
        }         
        return cleanedRecords;
    }
    records = cleanRecords();   // array
    console.log('after cleanning, length:', records.length);

    docs = docs.concat(records); 

}
// handleOneSheet(2);

handleAllSheets = function(){
    for (let index = 0; index < sheets.length; index++){
        handleOneSheet(index);
    }
}


let run = function(){
    handleOneSheet(2);
    console.log(docs)
    console.log('docs.length:', docs.length);  
    fs.writeFileSync('ruodian_tbwj_data.json',JSON.stringify(docs));  
}

let checkOutputFile = function() {
    let out = fs.readFileSync('ruodian_tbwj_data.json')
    out1 = JSON.parse(out)
    console.log(out1) 
    console.log(`typeof output json.parsed: ${typeof out1}`);
    console.log(`Nr. of records: ${out1.length}`);
}



run();  
checkOutputFile();

