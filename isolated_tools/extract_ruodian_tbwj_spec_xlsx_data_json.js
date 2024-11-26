/**
 * excel sheet "data"
 * to .json file
 * add some redundant keys
 * tbwj: 投标文件
 */



const fs = require('fs');
const XLSX = require('xlsx');


let path = `/Users/yhmao/sgoh/SGOH/07.弱电/转/弱电投标文件p140-256.xlsx`


const wb = XLSX.readFile(path);
const sheets = wb.SheetNames;
var docs = [];
console.log('\n\n\n\n')



/**
 * Work with excel sheet "data"
 */
let handleSheet = function() {
    let records = XLSX.utils.sheet_to_json(wb.Sheets['data']);
    console.log(`Total lines: ${records.length}`)    


    /**
     * 
     * @returns {Array} normalized records ready for db
     */
    let normalizeRecords = function() {
        let normalizedRecords = [];
        console.log('cleaning...')
        let cat = '';
        let cat2 = '';

        /**
         * 
         * @param {*} row as each record
         * @returns record with more keys
         */
        let handleRow = function(row) {
            row['file'] = row['文件名'];
            row['dataCreated'] = Date.now();
            row['dateUpdated'] = Date.now();
            row['System'] = row['子系统'];
            row['Item'] = row['货物名称'];
            row['Specification'] = row['投标规格'];
            row['Cat'] = "弱电";
            row['Text'] = `[子系统]: ${row['子系统']}; \n[序号]: ${row['序号']}; \n[货物名称]: ${row['货物名称']}; \n[投标规格]: ${row['投标规格']}}`
            return row;            
        }


        for (let r=0; r < records.length; r++) {
            let row = records[r];    
            row =  handleRow(row);
            if(row) normalizedRecords.push(row);
        }         
        return normalizedRecords;
    }
    records = normalizeRecords();   // array
    console.log('after cleanning, length:', records.length);

    docs = docs.concat(records); 
    // console.log('doc[0]:', docs[0]);
    console.log('doc[233]:', docs[233]);

}
// handleSheet();


/**
 * call function to get records {Array}
 * persistent records to .json file (./)
 */
let run = function(){
    handleSheet();
    console.log(docs)
    console.log('docs.length:', docs.length);  
    fs.writeFileSync('ruodian_tbwj_spec_dev.json',JSON.stringify(docs));  
}

let checkOutputFile = function() {
    let out = fs.readFileSync('ruodian_tbwj_spec_dev.json')
    out1 = JSON.parse(out)
    console.log(out1) 
    console.log(`typeof output json.parsed: ${typeof out1}`);
    console.log(`Nr. of records: ${out1.length}`);
}



// run();  
// checkOutputFile();

