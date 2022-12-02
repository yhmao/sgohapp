const Jimp = require('jimp');
const sizeOf = require('image-size');

const IMAGE_EXTS = ['jpeg', 'png', 'bmp', 'tiff', 'gif','jpg'];

// module.export.IMAGE_EXTS = IMAGE_EXTS;

module.exports.yyyymmdd_hhmmss = function(){
  var date = new Date();
  var yyyymmdd_hhmmss = date.getFullYear() + ("0" + (date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '_'
    + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
  // console.log('utils.js => yyyymmdd_hhmmss:', yyyymmdd_hhmmss);
  return yyyymmdd_hhmmss;
};


module.exports.downsizeImage = function(originalImage,cb){  // params: full path
  console.log('enter function downsizeImage...');
  console.log('passed parameter: ', originalImage);
  if ( !IMAGE_EXTS.includes(originalImage.split('.').pop().toLowerCase())) { console.log('not an image file for downsizing, return directly.');return cb(); }  // not an image file path
  else
  {
    try{
      Jimp.read(originalImage, (err,image)=>{
        if (err) {
          console.log('in function downsizeImage,  err reading originalImage:', originalImage,err);
          return cb();
        }
        else
        {

          // var dimensions = sizeOf(image);
          console.log('originalImage dimensions:', image.bitmap.width, image.bitmap.height);
          var w = image.bitmap.width;
          var h = image.bitmap.height;
          var max = Math.max(w,h);
          console.log('max: ', max);

          if (w>=h){ console.log('max w :', w);}
          else{console.log('max h :', h);}

          if (image.bitmap.width <= 500) {console.log('image width <= 500, no need to downsize.'); return cb(); } // no downsize for image width <= 400
          else
          {
            // if originalImage
            // orginalImage
            //   .resize(width, height);
            image.resize(500, Jimp.AUTO);
            console.log('resized to 500 x AUTO');
            image.write(originalImage,cb);
            console.log('in function downsizeImage,  finished downsizeImage.');
            return;
          }
        }

      });
    }
    catch(error){
      console.log(`error in downsizeImage: ${orginalImage}, and the error message is: \n ${error}`);
      return cb();
    }    
  }























  // Jimp.read(originalImage, (err,image)=>{
  //   if (err) {
  //     console.log('in function downsizeImage,  err reading originalImage:', err);
  //     return;
  //   }
  //   // var dimensions = sizeOf(image);
  //   console.log('originalImage dimensions:', image.bitmap.width, image.bitmap.height);
  //   var w = image.bitmap.width;
  //   var h = image.bitmap.height;
  //   var max = Math.max(w,h);
  //   console.log('max: ', max);
  //   if (w>=h){ console.log('max w :', w);}else{console.log('max h :', h);}
  //   if (image.bitmap.width <= 500) {console.log('image width <= 500, no need to downsize.'); return cb(); } // no downsize for image width <= 400
  //   // if originalImage
  //   // orginalImage
  //   //   .resize(width, height);
  //   image.resize(500, Jimp.AUTO);
  //   console.log('resized to 500 x AUTO');
  //   image.write(originalImage,cb);
  //   console.log('in function downsizeImage,  finished downsizeImage.');
  //   return;
  // });
};

module.exports.randomString = function(len) {
  var buf = [];
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charlen = chars.length;
  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen-1)]);
  }
  return buf.join('');
};
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


console.log('utils.js.');
