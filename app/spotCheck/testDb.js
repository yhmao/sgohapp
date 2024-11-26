// 测试DB聚合

let db = require('./database.js')
// console.log(db)
 
let d = 1;
let dayMs = 60*60*24*1000;
let tStart = new Date(
  new Date().setHours(0,0,0,0)
);
let tEnd = new Date(
    new Date()
)
let spot = '005';

let agg = db.SCInOut.aggregate([
    {
        $match: {
            Clock: {
                $gt: tStart, 
                $lt: tEnd,
            },
            // Spot: spot,
        }
    },

    {
        $sort: {
            Name: 1, Clcok: -1    
        }
    },

    {
      $group: {
        _id: "$Name",
        InOut: {
          $push: "$InOut"
        },
        // Clocks: {
        //   $push: "$Clock"
        // },
        LastClock: {$max: "$Clock"}
      }
    },

    {$addFields: {
        InOut: {
          $arrayToObject: {
            $map: {
              input: {
                $setUnion: "$InOut"
              },
              as: "j",
              in: {
                k: "$$j",
                v: {
                  $size: {
                    $filter: {
                      input: "$InOut",
                      cond: {
                        $eq: [
                          "$$this",
                          "$$j"
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },  

    {$addFields: {
      countIn: "$InOut.in",
      countOut: "$InOut.out"
    }},

    {$project: {
      InOut: 0
    }},

])


agg.exec()
    .then((result) => {
        console.log('result:', JSON.stringify(result,null,5))
        console.log(`共输出${result.length}个列表元素`)
    })




