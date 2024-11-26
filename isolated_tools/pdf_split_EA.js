// re-org pdf
// input: EA TP tender.pdf
// output: seperate pdf
// params: [input, page-from, page-to, output]  p1: page-from, p2: page-to
// pdf p1: index=0


const pdflib = require('pdf-lib');
const fs = require('fs');
const path = require('path');


// output dir
let outDir = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF单独/out/";
let count = 0;

// input
let EA_100 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/EA 电气布置/1440-EA-100 Tender Set.pdf"
let EA_200 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/EA 电气布置/1440-EA-200 Tender Set.pdf"
let EA_300 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/EA 电气布置/1440-EA-300 Tender Set.pdf"
let EA_400 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/EA 电气布置/1440-EA-400 Tender Set.pdf"
let EA_900 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/EA 电气布置/1440-EA-900 Tender Set.pdf"



const PDFDocument = pdflib.PDFDocument;

// extract
let handlePDF = async function(originalPath, p1,p2,outPath) {
    let range = (start,stop,step=1) =>  Array.from({length: (stop-start)/step+1}, (_,i)=> start + i*step)
    
    console.log('range:',range(p1,p2));
    const originalBytes = fs.readFileSync(originalPath);
    let originalDoc = await PDFDocument.load(originalBytes);

    let outDoc = await PDFDocument.create();
    let pages = await outDoc.copyPages(originalDoc,range(p1,p2,1).map(x=>x-1));
    pages.forEach(page=> outDoc.addPage(page))
    let outBytes = await outDoc.save();

    outPath = path.join(outDir,outPath+".pdf");
    fs.writeFileSync(outPath,outBytes);
    count = count + 1;
    console.log(`Count: ${count}, Original: ${originalBytes.length}; Out: ${outBytes.length}`);
}


// params 
let EA_Matrix = [

    [EA_100,8,21,"1440-EA-LAY-1XX"],
    [EA_100,26,27,"1440-EA-SCD-101"],
    [EA_100,28,28,"1440-EA-SCD-102"],
    [EA_100,29,60,"1440-EA-SCD-104"],

    [EA_200,8,20,"1440-EA-LAY-2XX"],
    [EA_200,24,26,"1440-EA-SCD-201"],
    [EA_200,27,51,"1440-EA-SCD-204"],

    [EA_300,8,16,"1440-EA-LAY-3XX"],
    [EA_300,22,23,"1440-EA-SCD-301"],
    [EA_300,24,24,"1440-EA-SCD-302"],
    [EA_300,25,45,"1440-EA-SCD-304"],

    [EA_400,8,16,"1440-EA-LAY-4XX"],
    [EA_400,22,22,"1440-EA-SCD-401"],
    [EA_400,23,23,"1440-EA-SCD-402"],
    [EA_400,24,27,"1440-EA-SCD-404"],

    [EA_900,8,10,"1440-EA-LAY-9XX"],
    [EA_900,16,16,"1440-EA-SCD-901"],
    [EA_900,17,17,"1440-EA-SCD-902"],
    [EA_900,18,19,"1440-EA-SCD-904"],
];



let all_Matrix = [
    EA_Matrix,
];


// per profession
let handle_XX_Matrix = function(XX_Matrix) {
    for (let i = 0; i < XX_Matrix.length; i++) {
        handlePDF(...XX_Matrix[i]);        
        console.log("Matrix: ", XX_Matrix[i]);
    }
}

// all tender files
for (let i = 0; i < all_Matrix.length; i++ ) {
    handle_XX_Matrix(all_Matrix[i]);
}



