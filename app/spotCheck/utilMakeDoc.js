
// import * as fs from "fs";
// import { Document, Packer, Paragraph, TextRun } from "docx";
const fs = require('fs');
const {Document,Packer,Paragraph,TextRun,Table, TableRow, TableCell,BorderStyle, WidthType, HeadingLevel,VerticalAlign,
    TextDirection, PageOrientation,convertInchesToTwip, convertMillimetersToTwip,
    HorizontalPosition,
    ImageRun} = require('docx');
const docx = require('docx');
const path = require('path');





// // Used to export the file into a .docx file
// Packer.toBuffer(doc).then((buffer) => {
//     fs.writeFileSync("doc.docx", buffer);
// });

module.exports.utilMakeDoc = async function(DATA, options) {
    console.log('export utilMakeDoc...')

    console.log(typeof DATA)
    console.log(DATA)
    
    let {Project, Spot, Description} = options;
    let DateCreated = new Date()

    console.log(`制作DOC文档时收到的数据：Project:${Project}, Spot: ${Spot}, Description: ${Description}, DateCreated: ${DateCreated}`)
    console.log(`制作文件时收到的聚合数据DATA：`, DATA)
    


    let sectionsStyles = {
        characterStyles: [
            {
                id: "myRedStyle",
                name: "My Wonky Style",
                basedOn: "Normal",
                run: {
                    color: "FF0000",
                    italics: true,
                },
            },
            {
                id: "strong",
                name: "Strong",
                basedOn: "Normal",
                run: {
                    bold: true,
                },
            },
        ],
    };


    let sectionsProperties = {

        page: {
            margin: {
                top: convertMillimetersToTwip(12),
                right: convertMillimetersToTwip(10),
                bottom: convertMillimetersToTwip(12),
                left: convertMillimetersToTwip(10),
            },
            size: {
                orientation: PageOrientation.LANDSCAPE,
                height: convertMillimetersToTwip(297),
                width: convertMillimetersToTwip(210),
            },
            pageNumbers: {
                start: 1,
                formatType: docx.NumberFormat.DECIMAL,
            }            
        },

    };

    // let footerTabStops = [
    //     {type: docx.TabStopType.RIGHT, position: docx.TabStopPosition.MAX / 3 * 1},
    //     {type: docx.TabStopType.RIGHT, position: docx.TabStopPosition.MAX / 3 * 2},
    //     {type: docx.TabStopType.RIGHT, position: docx.TabStopPosition.MAX },
    // ]

    let sectionsFooters = {
        default: new docx.Footer({
            children:[
                new Paragraph({
                    // tabStops: footerTabStops,
                    children: [
                        // new TextRun({
                        //     text: new Date().toLocaleDateString() + "\t《巡视汇总报告》\t" +
                        //     "第" + docx.PageNumber.CURRENT + "页，" +
                        //     "共" + docx.PageNumber.TOTAL_PAGES + "页"
                        // }),
                        new TextRun({
                            text: new Date().toLocaleDateString(),
                        }),
                        new TextRun({
                            text: "\t\t\t\t\t\t《巡视汇总报告》",
                        }),
                        new TextRun({
                            children: ["\t\t\t\t\t\t\t\t\t\t第", docx.PageNumber.CURRENT, "页，"]
                        }),
                        new TextRun({
                            children: ["共", docx.PageNumber.TOTAL_PAGES, "页"]
                        }),
                    ]
                })
            ]
        })
    }



    const generateRows = (list) =>
        list.map(
            ({ Role, Status, nokItems, Text, Files }) =>
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph( Role )],
                            verticalAlign: VerticalAlign.CENTER,
                            horizontalAlign: HorizontalPosition.CENTER,
                            textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
                        }),


                        new TableCell({
                            children: [new Paragraph(JSON.stringify(Status))],
                            verticalAlign: VerticalAlign.CENTER,
                            textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
                        }),
                        new TableCell({
                            children: [new Paragraph( JSON.stringify(nokItems) )],
                            verticalAlign: VerticalAlign.CENTER,
                            textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
                        }),
                        new TableCell({
                            children: [new Paragraph( Status.NOK?"不合格":"合格" )],
                            verticalAlign: VerticalAlign.CENTER,
                            textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,                        
                        }),
                     
                    ],
                }),
        );

    let myTitle = new Paragraph({
                spacing: {
                    before: 200,
                    after: 500,
                },
                text: "巡视报告",
                heading: HeadingLevel.HEADING_1,
                alignment: docx.AlignmentType.CENTER,
                bold: true,
                
    })
    
        /**
         * 第一行
         */
    const Row1 = new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph( '项目名称' )],
                verticalAlign: VerticalAlign.CENTER,
                horizontalAlign: HorizontalPosition.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [new Paragraph( Project )],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [new Paragraph( '时间' )],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [new Paragraph( DateCreated.toLocaleDateString() )],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,                        
            })
        ],
    })
    
    /**
     * 第二行
     */
    const Row2 = new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph( '开点编号' )],
                verticalAlign: VerticalAlign.CENTER,
                horizontalAlign: HorizontalPosition.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [new Paragraph( Spot )],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [new Paragraph( '开点区域及安全关注点描述' )],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [new Paragraph( Description )],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,                        
            })
        ],
    });

    /**
     * 分部门列表表头
     */
    const Row3 = new TableRow({
        children: [
            new TableCell({
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [
                            new TextRun({
                                text: "职责",
                                bold: true,
                                size: 20,
                            }),
                        ],
                    }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [
                            new TextRun({
                                text: "巡视统计",
                                bold: true,
                                size: 20,
                            }),
                        ],
                    }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [
                            new TextRun({
                                text: "不合格汇总",
                                bold: true,
                                size: 20,
                            }),
                        ],
                    }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                textDirection: TextDirection.LEFT_TO_RIGHT_TOP_TO_BOTTOM,
            }),
            new TableCell({
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [
                            new TextRun({
                                text: "是否合格？",
                                bold: true,
                                size: 20,
                            }),
                        ]                                            
                    })
                ]
            }),
        ],
    });


    /**
     * 详细信息：说明，照片
     * 分部门
     */



    /**
     * 根据附件列表生成对应图
     * @param {*} files 文件列表
     * @returns 
     */
    let generateImageRuns = (files) => 
        files.map(
            (file) => 
                new ImageRun({
                    data: 
                        ((file) => {
                            console.log('file:', file)
                            let folder = path.join(process.cwd(), 'uploadSpotCheck')
                            console.log('folder:', folder)
                            let fileRead = 
                                fs.readFileSync(path.join(folder, file)) ||
                                fs.readFileSync(path.join(folder, file.split('.')[0]+'_thumbnail.'+file.split('.')[1]));

                            console.log('fileRead:', fileRead);
                            return fileRead;
                        })(file),
                    transformation: {
                        width:250,
                        height:250,
                    }
                })
            
        )

    /**
     *  统计数据列表生成每组各个段落
     * @param {*} DATA 列表
     * @returns 
     */
    let generateParagraphsForAllGroup = (DATA) => 
        DATA.map(
            (group) => 
                [
                    new Paragraph({
                        text: "职责部门:" + group.Role,
                    }),

                    new Paragraph({
                        text: "巡视说明：" + group.Text.join('; ')
                    }),

                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "巡视照片："
                            }),
                            ...generateImageRuns(group.Files)

                        ]
                    }),
                ]
            
        );
    
    /**
     * 组成一个列表数组
     * @param {*} DATA 
     * @returns 
     */
    let expandAllGroups = (DATA) => {
        let expandedList = [];
        // console.log('generate all group result:', generateParagraphsForAllGroup(DATA))
        let list = generateParagraphsForAllGroup(DATA)
        console.log('list:', list)
        for (let i =0; i< list.length; i++ ) {
            expandedList = expandedList.concat(list[i])
        }
        // console.log('expandedList:', JSON.stringify(expandedList,null, 2))
        return expandedList;
    }




    
    
    




    
    const doc = new Document({
        sections: [
            {
                styles: sectionsStyles,
                properties: sectionsProperties,
                footers: sectionsFooters,


                children: [

                    myTitle,
    
                    new Table({

                        rows: [
                            Row1,
                            Row2,
                            Row3,                            
                            ...generateRows(DATA),
                        ],
                    }),
                    new Paragraph({ children: [new docx.PageBreak()]}),

                    // 详细说明及照片
                    ...expandAllGroups(DATA)

                  


                ],
            },
        ],
    });

    // Used to export the file into a .docx file
    // Packer.toBuffer(doc).then((buffer) => {
    //     fs.writeFileSync("docXXX.docx", buffer);
    //     console.log('已保存在根目录中docXXX.docx')
    // });
    

    return Packer.toBuffer(doc);

}


