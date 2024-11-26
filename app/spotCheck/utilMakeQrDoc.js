const fs = require('fs');
const {Document,Packer,Paragraph,TextRun,Table, TableRow, TableCell,BorderStyle, WidthType, HeadingLevel,VerticalAlign,
    TextDirection, PageOrientation,convertInchesToTwip, convertMillimetersToTwip,
    HorizontalPosition,
    ImageRun} = require('docx');
const docx = require('docx');
const path = require('path');
// const { width } = require('pdfkit/js/page');

let width = 400;
let height = 400;

module.exports.utilMakeQrDoc = async function(DATA, options) {

    let {project,spot,inBuffer, outBuffer} = options;
    console.log(`project:${project}\nspot:${spot}\n`);

    let myTitle = new Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
            new TextRun({
                text: "现场巡更二维码",
                bold: true,     
                size: "20pt",                   
            })
        ]
    });

    let qrIn = new Paragraph({
        alignment: docx.AlignmentType.CENTER,
        spacing: {
            before: 100,
        },
        children: [
            new ImageRun({
                data: inBuffer,
                transformation: {
                    width: width,
                    height: height,
                },
            }),
        ],
    });

    let qrInCaption = new Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
            new TextRun({
                text: '进场:'+ "  " +  project + " | " + spot,
                bold: true,
                size: "16pt"
            }),
        ]
    });


    let qrOutCaption = new Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
            new TextRun({
                text: '离场:'+ "  " +  project + " | " + spot,
                bold: true,
                size: "16pt"
            }),
        ]
    });


    let qrOut = new Paragraph({
        spacing: {
            before: 300,
        },
        alignment: docx.AlignmentType.CENTER,
        children: [
            new ImageRun({
                data: outBuffer,
                transformation: {
                    width: width,
                    height: height,
                }
            })
        ]
    })



    const doc = new Document({
        sections: [
            {
                children: [
                    myTitle,
                    qrIn,
                    qrInCaption,
                    qrOut,
                    qrOutCaption,
                ],
            },
        ],
    });


    return Packer.toBuffer(doc);

}