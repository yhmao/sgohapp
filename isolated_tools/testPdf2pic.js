const {fromPath} = require('pdf2pic');
console.log('fromPath:', fromPath);
const options = {
    density: 100,
    saveFileName: 'untitled',
    format: 'png',
    width: 600,
    height: 600,
};

let pdfFile = "/Users/yhmao/sgoh/SGOH/06.舞台/TP舞台招标PDF单独/1440-PL-DOC-101.pdf";
console.log(`pdf file to be converted: ${pdfFile}`);

const convert = fromPath(pdfFile, options);
console.log('convert:', convert);
const page = 1;


async function convertPdfPageToImage() {
    try{
        const result = await convert(page, {
            responseType: 'image',
        })
    } catch (error) {
        console.log('Conversion error:', error);
    }
    console.log(`Page ${page} is now converted as an image.`);
    console.log('result:', result);
};

convertPdfPageToImage()