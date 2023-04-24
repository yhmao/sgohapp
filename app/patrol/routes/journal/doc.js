console.log('app/patrol/routes/journal/doc.js');
// import * as fs from "fs";

// import docx from "docx"; 
// const {
// 	AlignmentType,
//     BorderStyle,
//     convertInchesToTwip,
//     Document,
//     HeadingLevel,
//     Packer,
//     Paragraph,
//     ShadingType,
//     Table,
//     TableCell,
//     TableRow,
//     WidthType,
// } = docx;  

const path = require('path');
const db = require('../../database');
const fs = require('fs');
const docx = require('docx');
const {
	AlignmentType,
    BorderStyle,
    convertInchesToTwip,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    WidthType,
} = docx;  


let makeForm = async function(j) {
    console.log('makeForm');
    console.log('j:',j);
    const table = new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [
                        new Paragraph({text:"工程进度控制情况："}),
                        new Paragraph({text:j.schedule})
                    ] })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [
                        new Paragraph({text:"工程质量控制情况："}),
                        new Paragraph({text:j.quality})
                    ] })
                ]                
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [
                        new Paragraph({text:"工程材料审查情况："}),
                        new Paragraph({text:j.material})
                    ] })
                ]                
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [
                        new Paragraph({text:"工程建设其他情况："}),
                        new Paragraph({text:j.others})
                    ] })
                ]                
            }),            
        ],
        width: {size:100, type: WidthType.PERCENTAGE}
    });



    const doc = new Document({
        sections: [
            {
                children:[
                    new Paragraph({text: `日期：${j.day}  天气：${j.weather}  气温：${j.temp}`}),
                    table,
                    new Paragraph({text: `编写人：${j.author}   总监： ${j.supervisor}`}),
                ]
            },
        ],
    });



    Packer.toBuffer(doc).then((buffer)=>{
        fs.writeFileSync(path.join(__dirname,`J${j.day}.docx`), buffer);
    });

    // let buffer = await Packer.toBuffer(doc);
    // await fs.writeFileSync(`监理日志${j.day}.docx`, buffer);
    
}


let generateJForm = async function(req,res,next) {
    console.log('generateJForm');
    let _id = req.params._id;
    console.log('_id:', _id);
    let j = await db.Journal.findById(_id);
    console.log('j:', j);
    await makeForm(j);
    console.log('form made.');
    

    res.sendFile(`J${j.day}.docx`,{root:path.join(__dirname)});








    // res.send('response from generateJForm.');
    // res.json(j);
};

module.exports = exports = {
    generateJForm,
}