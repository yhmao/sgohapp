const fs = require('fs');

// read file
const p = 'D:\\SGOH\\06.舞台\\转\\text.txt';
let textArray = fs.readFileSync(p,{encoding: 'utf-8'}).toString().split('\n');

let checkReadFile = function(lines=100) {
    console.log(`display first ${lines}lines:\n\n`)
    for ( let i = 0; i<lines; i++ ) {
        console.log(`----------Line: ${i} ----------`)
        console.log(textArray[i])        
    }
    console.log(`\n\n\ndisplayd above first ${lines} lines.\n\n`)
    console.log('length:', textArray.length)
}

//  '\\u4e00-\\u9fa5';  // 匹配中文字符：/[\u4e00-\u9fa5]/

// init
var cat='', cat_='';
var doc = {};
var docs = [];
var sub1 = '',sub2 = '';

// patterns
let cat1 = /标段/i;
let cat2 = /^[\u4e00-\u9fa5\w]+\s*$/i;
let data = /^\d{1,3}\s{2}[\u4e00-\u9fa5\w]{6,15}\s{4}/i;
let data_ = /^\s{8,10}(\S+\s{1,2})+\s+/i;
let other = /\s*/i;

let parseCat1 = function(text) {
    console.log(text);
    let data = text.split('|')
    if (data.length < 4) {console.log('seems not cat1(title)');return;}
    let title = data[0].replace(/工程名称：上海大歌剧院建设项目/ig,'');
    let cat1 = title;
    console.log({cat1})
    sub1 = title.split('\\')[1]
    sub2 = title.split('\\')[2]
    cat = cat1;

}

let parseCat2 = function(text) {
    console.log(text);
    cat_ = text.trimEnd();
    let cat2 = {cat_};
    console.log(cat2)
}


let parseData = function(text) {
    console.log(text);
    let data = text.split('|');

    let info = function(data){
        console.log('data length:', data.length)
        console.log('data:',data)
    }
    // info(data);    
    let normalize = function(data) {
        if (data.length === 9 ) {data.push('')}
        else if (data.length === 11) {
            let insert = data[3] + data[4];
            data.splice(3,2,insert)            
        } else if (data.length < 9 || data.length >11) {
            console.log('seems too short or too many')            
        }
        return data;
    }

    data = normalize(data);

    let [sn,code,item,description,work,unit,quantity,unitPrice,totalPrice,labor] = data;

    doc = {};
    let makeDocKeyEn = function(){
        doc = {sn,code,item,description,work,unit,quantity,unitPrice,totalPrice,labor};
        doc.filename = '舞台工程量清单';
        doc.cat = cat;
        doc.sub1 = sub1;
        doc.sub2 = sub2;
        doc.cat_ = cat_;        
    }
    // makeDocKeyEn();

    let makeDocKeyCn = function(){
        
        doc['序号'] = sn;
        doc['项目编码'] = code;
        doc['项目名称'] = item;
        doc['项目特征描述'] = description;
        doc['工程内容'] = work;
        doc['计量单位'] = unit;
        doc['工程量'] = quantity;
        doc['综合单价'] = unitPrice;
        doc['合价'] = totalPrice;
        doc['人工费'] = labor;
        doc['文件名'] =  '舞台工程量清单';
        doc['工程名称'] = cat;
        doc['子系统'] = sub1;
        doc['位置'] = sub2;
        doc['子子类'] = cat_;     
        doc['专业'] = '舞台';
        // common in EN
        doc['date'] = Date.now();
        doc['file'] = '舞台工程量清单';
        doc['item'] = item;
        doc['description'] = description + '  ' + work;
        doc['location'] = sub2;
        doc['quantity'] = parseFloat(quantity);
        doc['price'] = parseFloat(unitPrice);
        doc['cost'] = parseFloat(totalPrice);
        doc['profession'] = '舞台';
        doc['subSystem'] = sub1;
        doc['subSubSystem'] = sub2;
    }
    makeDocKeyCn();

    docs.push(doc);
    console.log(doc);    
}

let parseData_ = function(text) {
    console.log(text);
    let data_ = text.split('|');

    if (!data_[0]) throw new Error('data_ should start with empty');

    console.log('data_:', data_);
    console.log('data_ length:', data_.length)

    let normalizeData_ = function(data_) {
        if (data_.length === 2) {data_.push('')}
        else if (data_.length >3) {
            let insert = data_.slice(1,-1).join()
            data_.splice(1,data_.length-2,insert)
        } else if (data_.length<2) {console.log('seems data not valid');return null;}
        return data_;
    }
    data_ = normalizeData_(data_);

    let [_,description,work] = data_;

    console.log({description,work})

    let joinEn = function(description,work) {
        let doc = docs.pop();
        doc.description += description;
        doc.work += work;
        docs.push(doc);        
    }
    // joinEn(description,work);

    let joinCn = function(description,work) {
        let doc = docs.pop();
        doc['项目特征描述'] += description;
        doc['工程内容'] += work;
        docs.push(doc);        
    }
    joinCn(description,work);

    console.log('after join:')
    console.log(docs.slice(docs.length-1));
}

let parseOther = function(text) {
    console.log(text);    
    console.log('other')
}

let groupy = function(text) { // raw line
    let group;
    if (cat1.test(text)) {
        group = "cat1";
    } else if (cat2.test(text)) {
        group = "cat2";
    } else if (data.test(text)) {
        group = "data";
    } else if (data_.test(text)) {
        group = "data_";
    } else if (other.test(text)) {
        group = "other"
    } else {
        group = "other"
    }
    console.log(`group:${group}`)
    return group;
}

let parseText = function(text) { // text text       
    let trimmed = text.trimEnd().replaceAll(/\s{2,}/ig,' | ');
    let group = groupy(text);
    switch(group) {
        case 'cat1':
            parseCat1(trimmed);
            break;
        case 'cat2':
            parseCat2(trimmed);  
            break;
        case 'data':
            parseData(trimmed);
            break;
        case 'data_':
            parseData_(trimmed);
            break;
        case 'other':
            parseOther(trimmed)
            break;
        default:            
            console.log(trimmed);
            console.log('exception');
            break;
    }
}

let parseLine = function(lineNr) {
    console.log(`\n\n===L${lineNr}===`);
    parseText(textArray[lineNr-1])
}


let parseLines = function(s=1,e=textArray.length-1) {
    for (i=s; i<e; i++) {
        parseLine(i)
    }
}

let test = function() {
    Object.values(arguments).forEach((lineNr)=>{
        parseLine(parseInt(lineNr))
    })
}

let run = function() {
    parseLines(); 
    console.log('docs.lenght:', docs.length);
    fs.writeFileSync('wutai_tbwj.json',JSON.stringify(docs)); 
}


let myTest = function() {
    console.log('\n\n\n===========Test===== data_ ============')
    test(5000,5004,5010,5034,690,236) // data_
    console.log('\n\n\n===========Test===== data ============')
    test(3, 237)  //data
    console.log('\n\n\n===========Test===== cat ============')
    test(1)   // cat
    console.log('\n\n\n===========Test===== cat_ ============')
    test(2)   // cat_
    console.log('\n\n\n===========Test===== other ============')
    test(5191,5195,5213)  // other    
}


let checkOutputJSON = function(f='wutai_tbwj.json'){
   let out = fs.readFileSync(f)
    out1 = JSON.parse(out)
    console.log(out1) 
};

//////////////////////////////////////////////////
// checkReadFile();
run();
// myTest();
checkOutputJSON();

// checkOutputJSON('D:\\SGOH\\06.舞台\\转\\docs.json')
