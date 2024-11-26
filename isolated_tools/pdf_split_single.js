/**
 * Extract range of pages of original pdf file
 * and make a new pdf file only with those range of pages
 */



const pdflib = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const PDFDocument = pdflib.PDFDocument;

/**
 * Extract part of pdf pages and save as new pdf file
 * @param originalPath file path for input
 * @param p1 from page of input pdf (included)
 * @param p2 to page of input pdf (included)
 * @param outPath output file path
 * @returns void
 */
let handlePDF = async function(originalPath, p1,p2,outPath) {
    let range = (start,stop,step=1) =>  Array.from({length: (stop-start)/step+1}, (_,i)=> start + i*step)
    
    console.log('range:',range(p1,p2));
    const originalBytes = fs.readFileSync(originalPath);
    // let originalDoc = await PDFDocument.load(originalBytes);
    let originalDoc = await PDFDocument.load(originalBytes, {ignoreEncryption:true}); // if encrypted

    let outDoc = await PDFDocument.create();
    let pages = await outDoc.copyPages(originalDoc,range(p1,p2,1).map(x=>x-1));
    pages.forEach(page=> outDoc.addPage(page))
    let outBytes = await outDoc.save();

    fs.writeFileSync(outPath,outBytes);
    console.log(`Original: ${originalBytes.length}; Out: ${outBytes.length}`);
}

let originalPath = `/Users/yhmao/sgoh/SGOH/07.弱电/2022-10-31.弱电智能化专业分包工程技术规格说明书.pdf`
let outPath = `/Users/yhmao/sgoh/SGOH/07.弱电/2022-10-31.弱电智能化专业分包工程技术规格说明书.p140-256.pdf`

handlePDF(originalPath,140,256,outPath);
// handlePDF(originalPath,1,2,outPath);
