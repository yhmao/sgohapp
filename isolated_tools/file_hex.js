const fs= require('fs');

let p = 'sample.txt';
// p = 'output.pdf';
// p = 'sample.txt'


let fsReadFileSync = function(){
    let data = fs.readFileSync(p);
    console.log('data:', data)
    console.log('data.length:', data.length)
    console.log('typeof data:', typeof data)
    console.log('Array.isArray?: ', Array.isArray(data))
    console.log('data.toString("hex").slice(0,100):', data.toString('hex').slice(0,100))
    console.log('data.toString("hex"):', data.toString('hex'))
    console.log('data.toSring():', data.toString())
    console.log('\n========\n\n\n\n\n')
    console.log('data.toString("ascii):',data.toString('ascii'))    
}
fsReadFileSync();

let testBuffer = function() {
    const Buffer = require('node:buffer');
    console.log('Buffer:', Buffer)
    const buf1 = Buffer.Buffer.from('buffer')
    console.log('buf:', buf1)
}

// testBuffer();


