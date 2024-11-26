const Item = require('./database')

module.exports.home = function(req,res,next){
    res.render("home.pug");
}

module.exports.findOneById = async function(req,res,next){
    let id = req.params.id;
    console.log('id:', id);
    let item = await Item.findById(id);
    console.log('Found item: ', item);
    res.render('item.pug',{item});
}

module.exports.list = async function(req,res,next) {
    console.log('req.body: ', req.body)
    let formData = req.body;
    // set cookie
    res.cookie('q',formData)

    // query and project
  
    
    let q = {};
    q.Cat = formData.Cat?{$regex:formData.Cat,$options:'ig'}:null;
    q.Venue = formData.Venue?{$regex:formData.Venue,$options:'ig'}:null;
    q.System = formData.System?{$regex:formData.System,$options:'ig'}:null;
    q.Text = formData.Text?{$regex:formData.Text,$options:'ig'}:null;
    Object.keys(q).forEach(k=>{
        if (q[k]==null||q[k]== undefined || q[k] == '') delete q[k];
    });
    // let p = {Text:0}
    console.log('q:', q);
    // console.log('p:', p);

    //result    
    let total = await Item.count(q);
    console.log(`Found ${total} matched docs.`)
    res.cookie('total',total);
    let pages = Math.ceil(total/20);
    res.cookie('pages',pages);
    let page = 1;

    let items = await Item.find(q).limit(20)
    // console.log('result:', result);
    // res.json(result[0])

    // console.log("keys:", Object.keys(result[0].toJSON()))

    // console.log('result[0]:', result[0])
    console.log('items[0]:',items[0]);
    res.render('list.pug', {items,total,page,pages});
 
}

module.exports.page = async function(req,res,next) {
    let page = parseInt(req.params.page);
    console.log(`show page: ${page}`)
    let formData = req.cookies.q;
    let total = parseInt(req.cookies.total);
    let pages = parseInt(req.cookies.pages);
    console.log('req.cookies:', req.cookies)


    let q = {};
    q.Cat = formData.Cat?{$regex:formData.Cat,$options:'ig'}:null;
    q.Venue = formData.Venue?{$regex:formData.Venue,$options:'ig'}:null;
    q.System = formData.System?{$regex:formData.System,$options:'ig'}:null;
    q.Text = formData.Text?{$regex:formData.Text,$options:'ig'}:null;
    Object.keys(q).forEach(k=>{
        if (q[k]==null||q[k]== undefined || q[k] == '') delete q[k];
    });
    // let p = {Text:0}
    console.log('q:', q);

    let items = await Item.find(q).skip((page-1)*20).limit(20);
    console.log('items[0]._id:', items[0]._id);
    console.log({total,page,pages});
    res.render('list.pug',{items,total,page,pages})


}

// 分类汇总金额：位置/专业
let wtGroupSummary = async function(_id){
    let data = await Item.aggregate([
        {$match:{Cat:"舞台投标"}},
        {$group: {_id: _id, "Cost":{$sum: "$cost"}}}
    ]).exec();

    let total = (await Item.aggregate([
        {$match: {Cat: "舞台投标"}},
        {$group: {_id:"$Cat", "total":{$sum:"$cost"}}}
        // {$project: {total:{$sum:"$cost"}}}
    ]).exec())[0].total

    data.push({_id:"总计",Cost:total});
    data.unshift({_id:"分类",Cost:"金额"});

    console.log('data:', data, 'total:', total);
    return data;
}


module.exports.wtCostSummaryByVenue = async function(req,res,next){
    let data = await wtGroupSummary("$Venue")
    res.render('table.pug',{data});
    /*
    return data = [
        { _id: '排练厅和支持空间 ', Cost: 1826679.96 },
        { _id: '大歌剧厅 ', Cost: 245218654.75 },
        { _id: '中歌剧厅 ', Cost: 166377141.92000002 },
        { _id: '学术报告厅 ', Cost: 1243685.8 },
        { _id: '小歌剧厅 ', Cost: 79389341.65 },
        { _id: '总计', cost: 494055504.08 }
      ] 
    */
}

module.exports.wtCostSummaryByProfession = async function(req,res,next) {
    let data = await wtGroupSummary("$System")
    res.render('table.pug',{data});
    /*
    return data: [
        { _id: '舞台机械', Cost: 316113980.94 },
        { _id: '演出灯光', Cost: 95021824.4 },
        { _id: '音响通讯', Cost: 82919698.74 },
        { _id: '总计', cost: 494055504.08 }
      ]
    */    
}

module.exports.wtCostSummaryByVenueAndProfession = async function(req,res,next) {
    let data = await Item.aggregate([
        {$match:{"Cat":"舞台投标"}},
        {$group:{_id: {
            "空间":"$Venue",
            "专业":"$System"
            }, Cost: {$sum: "$cost"} }
        },
        {$sort: {"_id.空间":1, "_id.专业":1}},
        {$project: {"_id": {$concat: ["$_id.空间", "-", "$_id.专业"]},     "Cost":"$Cost"}}
    
    ]).exec();

    let total = (await Item.aggregate([
        {$match: {Cat: "舞台投标"}},
        {$group: {_id:"$Cat", "total":{$sum:"$cost"}}}
        // {$project: {total:{$sum:"$cost"}}}
    ]).exec())[0].total

    data.push({_id:"总计",Cost:total});
    data.unshift({_id:"分类",Cost:"金额"});

    console.log('data:', data, 'total:', total);
    res.render('table.pug',{data})
}

module.exports.listFiles = async function(req,res,next){
    let dir = require('path').join(__dirname, '../../uploadItem');
    let files = require('fs').readdirSync(dir);
    res.render('listFiles.pug', {files})
}




/*

curl -X POST \
    -H 'Content-Type: multipart/form-data' \
    -F venue=big \
    -F document=SC \
    -F text=drive \
    http://localhost:3000/wt/list






*/


