// 把ubuntu中uploadShare目录中的历史已上传文件记录入数据库
// 每个文件一个记录
// 已于5/29完成。

// folder
// dir
// each file:  fs.readdirSync()  -> filename
//     get: fs.statSync(path)  birthtime/birthtimeMs, size(bytes)
//         size
//         date
//         filename

//         db.Share: create doc and save:
//             date, 
//             dateUpdate,
//             user: 'admin',
//             filename,
//             fileSize,
//             title: filename,
//             text: filename,
//             keywords: '',
//             exposure: 'publick'


const fs = require('fs');
const path = require('path');
const db = require('..\/app\/share\/database.js');

let folder = `${__dirname}\/..\/uploadShare`;
console.log('folder:', folder);
let files = fs.readdirSync(folder);
console.log('files:', files);

files.forEach(file => {
    let stats = fs.statSync(path.join(folder,file));
    let fileSize = stats.size;
    let date = stats.birthtime;
    let dateUpdate = new Date();
    let filename = file;
    let user = 'admin';
    let title = filename;
    let text = filename;
    let exposure = 'public';
    let share = new db.Share({date,dateUpdate,user,filename,fileSize,title,text,exposure});
    console.log('share:', share);
    share.save(()=>{
       console.log(`one doc saved for file: ${filename}`);
    })
});
