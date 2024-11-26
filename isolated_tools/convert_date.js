
let numberToBullet = function(v){  // 40280 -> 4.12.10
    let excelToJS = function(v){
        return (v-25568)*24*3600*1000-12*3600*1000;
    }
    let d = new Date(excelToJS(v));
    let mm = d.getMonth()+1;
    let dd = d.getDate();
    let yy = d.getFullYear()-2000;
    let out = `${dd}.${mm}.${yy}`
    console.log(`from: ${v} to: ${out}`)
    return out;
}


let numberToYY = function(v){  // 40280 -> 4.12.10
    let excelToJS = function(v){
        return (v-25568)*24*3600*1000-12*3600*1000;
    }
    let d = new Date(excelToJS(v));
    let mm = d.getMonth()+1;
    let dd = d.getDate();
    let yy = d.getFullYear()-2000;
    let out = `${yy}`
    console.log(`from: ${v} to yy: ${out}`)
    return out;
}

let getLeadingBullet = function(group2) {
    let result = group2.split(" ")[0];
    return result;
}

let test =  function(){
    let group2 = "4.8 Loudspeakers System Deployable 扬声器系统 活动的"
    let v = 41372;
    console.log(numberToYY(v))
    console.log("Leading bullet: ", getLeadingBullet(group2))
    console.log(`Joined: ${getLeadingBullet(group2)}.${numberToYY(v)}`)    
}



let pattern = /^\d\/\d\/\d\d\d\d\ \w$/i;
let slashToPoint = function(text) {
    return text.replace(/\//ig,'\.').replace("20","");
}

db.items.find({Section:{$type:1}}).forEach(doc => {
    let newSection = `${doc.Section}`;
    console.log(`${doc.Section} => ${newSection}`)
    bulk.find({"_id":doc._id}).updateOne({
        $set: {Section:newSection}
    })
});



let text = '4/8/2018 f';
console.log(slashToPoint(text))



