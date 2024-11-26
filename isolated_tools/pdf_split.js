// re-org pdf
// input: SE/PL/SC TP tender.pdf
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
let SE_100 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SE 舞台机械/1440-SE-100 Tender Set.pdf"
let SE_200 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SE 舞台机械/1440-SE-200 Tender Set.pdf"
let SE_300 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SE 舞台机械/1440-SE-300 Tender Set.pdf"
let SE_400 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SE 舞台机械/1440-SE-400 Tender Set.pdf"
let SE_900 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SE 舞台机械/1440-SE-900 Tender Set.pdf"

let PL_100 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/PL 演出灯光/1440-PL-100 Tender Set.pdf"
let PL_200 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/PL 演出灯光/1440-PL-200 Tender Set.pdf"
let PL_300 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/PL 演出灯光/1440-PL-300 Tender Set.pdf"
let PL_400 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/PL 演出灯光/1440-PL-400 Tender Set.pdf"
let PL_900 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/PL 演出灯光/1440-PL-900 Tender Set.pdf"

let SC_100 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SC 音响通讯/1440-SC-100 Tender Set.pdf"
let SC_200 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SC 音响通讯/1440-SC-200 Tender Set.pdf"
let SC_300 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SC 音响通讯/1440-SC-300 Tender Set.pdf"
let SC_400 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SC 音响通讯/1440-SC-400 Tender Set.pdf"
let SC_900 = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF/SC 音响通讯/1440-SC-900 Tender Set.pdf"



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
let SE_Matrix = [

    [SE_100,6,209,"1440-SE-DOC-101"],
    [SE_100,214,220,"1440-SE-DOC-102"],
    [SE_100,226,237,"1440-SE-LAY-1XX"],
    [SE_100,242,254,"1440-SE-EQT-1XX"],

    [SE_200,6,206,"1440-SE-DOC-201"],
    [SE_200,212,219,"1440-SE-DOC-202"],
    [SE_200,224,234,"1440-SE-LAY-2XX"],

    [SE_300,6,100,"1440-SE-DOC-301"],
    [SE_300,106,107,"1440-SE-DOC-302"],
    [SE_300,112,128,"1440-SE-LAY-3XX"],
    [SE_300,134,148,"1440-SE-EQT-3XX"],

    [SE_400,6,73,"1440-SE-DOC-401"],
    [SE_400,78,78,"1440-SE-DOC-402"],
    [SE_400,84,91,"1440-SE-LAY-4XX"],
    [SE_400,96,99,"1440-SE-EQT-4XX"],

    [SE_900,6,64,"1440-SE-DOC-901"],
    [SE_900,70,70,"1440-SE-DOC-902"],
    [SE_900,76,79,"1440-SE-LAY-9XX"],
];

let PL_Matrix = [
    [PL_100,6,76,"1440-PL-DOC-101"],
    [PL_100,80,96,"1440-PL-DOC-102"],
    [PL_100,102,119,"1440-PL-LAY-1XX"],
    [PL_100,122,137,"1440-WL-LAY-1XX"],
    [PL_100,142,152,"1440-PL-SCH-1XX"],
    [PL_100,164,191,"1440-PL-SCD-101"],
    [PL_100,192,215,"1440-PL-SCD-102"],
    [PL_100,216,216,"1440-PL-SCD-103"],
    [PL_100,217,217,"1440-PL-SCD-104"],
    [PL_100,220,223,"1440-WL-SCD-101"],
    [PL_100,224,226,"1440-WL-SCD-102"],

    [PL_200,6,75,"1440-PL-DOC-201"],
    [PL_200,78,93,"1440-PL-DOC-202"],
    [PL_200,98,112,"1440-PL-LAY-2XX"],
    [PL_200,116,128,"1440-WL-LAY-2XX"],
    [PL_200,134,142,"1440-PL-SCH-2XX"],
    [PL_200,154,175,"1440-PL-SCD-201"],
    [PL_200,176,196,"1440-PL-SCD-202"],
    [PL_200,197,197,"1440-PL-SCD-203"],
    [PL_200,202,204,"1440-WL-SCD-201"],
    [PL_200,205,207,"1440-WL-SCD-202"],
    
    [PL_300,6,69,"1440-PL-DOC-301"],
    [PL_300,74,88,"1440-PL-DOC-302"],
    [PL_300,94,102,"1440-PL-LAY-3XX"],
    [PL_300,106,115,"1440-WL-LAY-3XX"],
    [PL_300,120,125,"1440-PL-SCH-3XX"],
    [PL_300,136,147,"1440-PL-SCD-301"],
    [PL_300,148,159,"1440-PL-SCD-302"],
    [PL_300,160,160,"1440-PL-SCD-303"],
    [PL_300,161,161,"1440-PL-SCD-304"],
    [PL_300,164,164,"1440-WL-SCD-301"],
    [PL_300,165,165,"1440-WL-SCD-302"],

    [PL_400,6,44,"1440-PL-DOC-401"],
    [PL_400,50,54,"1440-PL-DOC-402"],
    [PL_400,60,60,"1440-PL-LAY-400"],
    [PL_400,61,64,"1440-PL-LAY-7XX"],
    [PL_400,70,70,"1440-PL-SCH-701"],
    [PL_400,82,82,"1440-PL-SCD-401"],
    [PL_400,83,83,"1440-PL-SCD-402"],
    [PL_400,84,84,"1440-PL-SCD-403"],
    [PL_400,85,85,"1440-PL-SCD-404"],

    [PL_900,6,61,"1440-PL-DOC-901"],
    [PL_900,66,75,"1440-PL-DOC-902"],
    [PL_900,80,82,"1440-PL-LAY-9XX"],
    [PL_900,86,88,"1440-WL-LAY-9XX"],
    [PL_900,94,97,"1440-PL-SCH-9XX"],
    [PL_900,108,109,"1440-PL-SCD-901"],
    [PL_900,110,111,"1440-PL-SCD-902"],
    [PL_900,112,112,"1440-PL-SCD-903"],
    [PL_900,113,113,"1440-PL-SCD-904"],
    [PL_900,116,116,"1440-WL-SCD-901"],
    [PL_900,117,117,"1440-WL-SCD-902"],

];

let SC_Matrix = [
    [SC_100,6,112,"1440-SC-DOC-101"],
    [SC_100,118,159,"1440-SC-DOC-102"],
    [SC_100,164,178,"1440-SC-LAY-1XX"],
    [SC_100,182,190,"1440-LS-LAY-1XX"],
    [SC_100,194,204,"1440-CP-LAY-1XX"],
    [SC_100,210,227,"1440-SC-SCH-1XX"],
    [SC_100,232,250,"1440-SC-SCD-101"],
    [SC_100,251,279,"1440-SC-SCD-102"],
    [SC_100,280,297,"1440-SC-SCD-103"],
    [SC_100,298,308,"1440-SC-SCD-104"],

    [SC_200,6,107,"1440-SC-DOC-201"],
    [SC_200,112,150,"1440-SC-DOC-202"],
    [SC_200,156,167,"1440-SC-LAY-2XX"],
    [SC_200,170,178,"1440-LS-LAY-2XX"],
    [SC_200,182,190,"1440-CP-LAY-2XX"],
    [SC_200,196,213,"1440-SC-SCH-2XX"],
    [SC_200,218,235,"1440-SC-SCD-201"],
    [SC_200,236,262,"1440-SC-SCD-202"],
    [SC_200,263,279,"1440-SC-SCD-203"],
    [SC_200,280,290,"1440-SC-SCD-204"],

    [SC_300,6,104,"1440-SC-DOC-301"],
    [SC_300,110,147,"1440-SC-DOC-302"],
    [SC_300,152,158,"1440-SC-LAY-3XX"],
    [SC_300,162,169,"1440-LS-LAY-3XX"],
    [SC_300,172,177,"1440-CP-LAY-3XX"],
    [SC_300,182,198,"1440-SC-SCH-3XX"],
    [SC_300,204,217,"1440-SC-SCD-301"],
    [SC_300,218,236,"1440-SC-SCD-302"],
    [SC_300,237,242,"1440-SC-SCD-303"],
    [SC_300,243,254,"1440-SC-SCD-304"],

    [SC_400,6,59,"1440-SC-DOC-401"],
    [SC_400,64,104,"1440-SC-DOC-402"],
    [SC_400,110,114,"1440-RS-LAY-0XX"],
    [SC_400,118,118,"1440-SC-LAY-401"],
    [SC_400,119,121,"1440-SC-LAY-50X"],
    [SC_400,122,123,"1440-SC-LAY-60X"],
    [SC_400,124,127,"1440-SC-LAY-70X"],
    [SC_400,128,128,"1440-SC-LAY-801"],
    [SC_400,132,144,"1440-PA-LAY-8XX"],
    [SC_400,150,164,"1440-SC-EQT-6XX"],
    [SC_400,170,172,"1440-SC-SCH-40X"],
    [SC_400,174,175,"1440-SC-SCH-50X"],
    [SC_400,178,191,"1440-SC-SCH-6XX"],
    [SC_400,194,195,"1440-SC-SCH-70X"],
    [SC_400,198,208,"1440-SC-SCH-8XX"],
    [SC_400,214,215,"1440-SC-SCD-401"],
    [SC_400,216,217,"1440-SC-SCD-402"],
    [SC_400,220,221,"1440-SC-SCD-501"],
    [SC_400,222,227,"1440-SC-SCD-502"],
    [SC_400,230,234,"1440-SC-SCD-601"],
    [SC_400,235,242,"1440-SC-SCD-602"],
    [SC_400,246,246,"1440-SC-SCD-701"],
    [SC_400,247,250,"1440-SC-SCD-702"],
    [SC_400,254,254,"1440-SC-SCD-801"],
    [SC_400,255,255,"1440-SC-SCD-802"],
    [SC_400,256,259,"1440-SC-SCD-803"],
    [SC_400,260,260,"1440-SC-SCD-804"],


    [SC_900,6,89,"1440-SC-DOC-901"],
    [SC_900,94,120,"1440-SC-DOC-902"],
    [SC_900,130,134,"1440-LS-LAY-90X"],
    [SC_900,138,140,"1440-SC-LAY-90X"],
    [SC_900,146,152,"1440-SC-SCH-90X"],
    [SC_900,158,162,"1440-SC-SCD-901"],
    [SC_900,163,172,"1440-SC-SCD-902"],
]


let all_Matrix = [
    SE_Matrix,
    PL_Matrix,
    SC_Matrix
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



