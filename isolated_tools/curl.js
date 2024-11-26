// curl to simulate POST request

/*
curl -X POST -d "Venue=Big Opera Hall 大歌剧厅&System=PL 演出灯光" http://localhost:3000/item/list


let q = {
    Cat: '舞台TP',
  Venue: 'Big Opera Hall 大歌剧厅',
  System: 'PL 演出灯光',
  Text: { '$regex': '安装线管线槽和线缆', '$options': 'ig' } 
}

let p = {Cat:1, Venue:1, System:1,Text:1}

db.items.count(q)








*/