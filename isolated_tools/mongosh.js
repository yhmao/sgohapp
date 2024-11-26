bulk = db.items.initializeOrderedBulkOp();


db.items.find({Cat:"舞台TP","Document": "1440-SE-DOC-902"}).forEach(
	document => {
		bulk.find({"_id": document._id}).updateOne({
			'$set': {
                '项目': document.Item,
                '说明': document.Description,
                '数量': document.Quantity,
                '尺寸': document.Size,
                '行程': document.Travel,
                '速度': document.Speed,
                '荷载': document.Capacity,
                '标准和货源': document.StandardsSource
            }
		});
	}
)

bulk.execute()