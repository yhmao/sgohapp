

const fs = require('fs');

var iconv = require('iconv-lite');
// console.log('iconv:', iconv);
const path = require('path');
const db = require('..\/app\/tip\/database.js');

let folder = `C:\\Users\\yhmao\\Desktop\\text\\`;  //所有txet文件放在桌面的text文件夹中进行处理。

console.log('folder:', folder);
let files = fs.readdirSync(folder);
console.log('files:', files);
console.log('======================================');

files.forEach(file => {    
    let stats = fs.statSync(path.join(folder,file));
    let fileSize = stats.size;
    let created = new Date(stats.mtime);
    let modified = new Date();
    let filename = file;
    let title = "TEXT: " + filename;
    console.log('filename:', filename);

    fs.readFile(path.join(folder,filename),function(err, data) {
        if (err) throw err;

        console.log('==============================');
        console.log('FileSize:', fileSize);
        console.log('Filename:' + filename);

        var buf = Buffer.from(data,'binary');
 
        var str = iconv.decode(buf, 'GBK'); //使用iconv转成中文格式


        let tip = new db.Tip({created,modified,title,text:str});
        console.log('tip:', tip);
        tip.save(()=>{
            console.log(`one doc saved for file: ${filename}`);
            console.log('***************************************')
        })        
      });
    


});