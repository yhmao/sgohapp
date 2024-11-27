const fs = require('fs');
const {Document,Packer,Paragraph,TextRun,Table, TableRow, TableCell,BorderStyle, WidthType, HeadingLevel,VerticalAlign,
    TextDirection, PageOrientation,convertInchesToTwip, convertMillimetersToTwip,
    HorizontalPosition,PageBreak,
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
            new TextRun({
                text: "进 ",
                bold: true,
                size: 100             
            }),
            new ImageRun({
                data: inBuffer,
                transformation: {
                    width: width,
                    height: height,
                }
            }),
            new TextRun({
                text: " 进",
                bold: true,
                size: 100
            })
        ],
    });

    let qrInCaption = new Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
            new TextRun({
                text: '进场:   '+ "  " +  project + " | " + spot,
                bold: true,
                size: "16pt"
            }),
        ]
    });

    let instructionLine = function(p) {
        return new Paragraph({
            alignment : docx.AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: p,
                    bold: true,
                    size: "14pt"
                })
            ]
        })
    }

    let instructionAdditional = function(p) {
        return new Paragraph({
            alignment : docx.AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: p,
                    bold: false,
                    size: "14pt"
                })
            ]
        })
    }

    let inInstructionParagraphs = [
        "","","","","","","","","","",
        "进场时，微信扫码，点击继续，点击“进入”，完成进场。",
        "如提示未能识别，请输入手机号重新识别。",
        "如首次使用，请注册输入姓名与手机号提交后重新扫码。", 
        "","","","","","","","","","","","","","",

    ].map(l => instructionLine(l))

    let outInstructionParagraphs = [
        "","","","","","","","","","",
        "离场时，微信扫码，点击继续，",
        "点击“确认离场”；",
        "填写报告，输入说明，点击“提交报告”，并确认提交；",
        "如有照片，选择照片并点击“上传现场照片”。",
        "完成离场。",
        "","","",


    ].map(l => instructionLine(l)).concat(
        [
            "如提示未能识别，请输入手机号重新识别。",
            "如首次使用，请注册输入姓名与手机号提交后重新扫码。"
        ].map(l => instructionAdditional(l))
    )


    let qrOutCaption = new Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
            new TextRun({
                text: '离场:   '+ "  " +  project + " | " + spot,
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
            new TextRun({
                text: "出 ",
                bold: true,
                size: 100
            }),            
            new ImageRun({
                data: outBuffer,
                transformation: {
                    width: width,
                    height: height,
                },
                VerticalAlign: "middle"
            }),
            new TextRun({
                text: " 出",
                bold: true,
                size: 100
            })      
        ]
    })

    let pageBreak =  new PageBreak();
    console.log( inInstructionParagraphs, outInstructionParagraphs)

    const doc = new Document({
        sections: [
            {
                children: [
                    myTitle,
                    qrIn,
                    qrInCaption,
                    ...inInstructionParagraphs,
                    


                    // pageBreak,

                    myTitle,
                    qrOut,
                    qrOutCaption,
                    ...outInstructionParagraphs
                ],
            },
        ],
    });


    return Packer.toBuffer(doc);

}