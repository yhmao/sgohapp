/*

db.items.updateMany(
    {Cat:"舞台投标"},
    {$rename: {"位置":"Venue","子系统":"System"}}
)




db.items.updateMany(
    {Cat:"弱电"},
    {$rename: {"item":"Item"}}
)

db.items.updateMany(
    {Cat:"弱电"},
    {$unset: {"大类":""}}
)

let bulk = db.items.initializeOrderedBulkOp();

db.items.find({Cat:"舞台TP",ItemE:{$exists:true}}).forEach(
    doc=>{
        bulk.find({"_id":doc._id}).updateOne({
            $set: {"设备名称英文": doc.ItemE}
        })
    }
)


bulk.execute()

let bulk = db.items.initializeOrderedBulkOp();

db.items.find({Cat:"舞台TP"}).forEach(
    doc=>{
        bulk.find({"_id":doc._id}).updateOne({
            $set: {"分组": doc.Group}
        })
    }
)


bulk.execute()











*/