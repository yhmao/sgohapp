


// const PdfReader = require('pdfreader');
import {PdfReader} from 'pdfreader'
// const fs = require('fs');
import fs from "fs";


let pdfFilePath = "/Users/yhmao/sgoh/2022.11.14TP舞台工程招标文件/test/test1.pdf";

fs.readFile(pdfFilePath, (err,pdfBuffer)=>{
    new PdfReader().parseBuffer(pdfBuffer, function(err,item){
        if (err) console.log(`Error reading file: ${pdfFilePath} : ${err}`);
        else if (!item) console.log(`not item read.`)
        else if (item.text) {
            console.log(`Item text: ${item.text}`)
        }
    })







})