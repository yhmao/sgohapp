const fs = require('fs');
const path = require('path');

// const FOLDER = '/Users/yhmao/sgoh/vba';
const FOLDER = '/Users/yhmao/sgoh/2022.11.14TP舞台工程招标文件/TP 舞台工程招标文件 PDF 20220630'   // source
const TARGETFOLDER = '/Users/yhmao/sgoh/SGOH/wutai/excel/';                                   // destination

let files = fs.readdirSync(FOLDER);
console.log('files:', files);

// let fileNamePattern = /^1440-\w{2}-\w{3}-\d{3}\.pdf$/;   // pdf
let fileNamePattern = /^1440-\w{2}-\w{3}-\d{3}\.xlsx$/;     // xlsx

function handleFolder(folder) {
    let files = fs.readdirSync(folder);
    for (let i = 0; i < files.length; i++) {
        if (files[i].startsWith('.')) {
            // skip
        } else if (fs.statSync(path.join(folder,files[i])).isDirectory()) {
            console.log(`${files[i]} is dir.`);
            handleFolder(path.join(folder,files[i]));   // recursive
        } else if (fileNamePattern.test(files[i])) {
            fs.cp(path.join(folder,files[i]), path.join(TARGETFOLDER,files[i]),function(){
                console.log(`${path.join(folder,files[i])} copied.`)
            })
        } else {
            //console.log(`${path.join(folder,files[i])} not copied.`)
        }
    }
}

handleFolder(FOLDER);
