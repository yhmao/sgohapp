
module.exports.TIPONLY = false;
// module.exports.TIPONLY = true;

//check computer and select mongodb connection uri
console.log('process.platform:',process.platform);
const os = require('os');
console.log('hostname:', os.hostname());

if(os.hostname() == "DESKTOP-F1V3PN0"){  // MI
    // module.exports.HOST_DB = 'MI_Local';  // laptop, local db
    module.exports.HOST_DB = 'MI_Ali';   // laptop, ali db
} else if (process.platform === 'darwin') {  // Apple
    module.exports.HOST_DB = 'MI_Ali';    // laptop, ali db
} else {                                 // Ali
    module.exports.HOST_DB = 'Ali_Ali'; 
}


