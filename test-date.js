var from = new Date(new Date().setHours(00,00,00));
console.log(from);
console.log("hello");
var end = new Date(new Date().setHours(23,59,59));
console.log(end);

console.log('-------------');
var moment = require('moment');

var utcDate = moment.utc().toDate();
console.log('utcDate:', utcDate);
console.log('Date():', new Date());

console.log('test-date.js.');


// start today
var start = moment().startOf('day');
// end today
var end = moment().endOf('day');

console.log('start:',start);
console.log('end:',end);
