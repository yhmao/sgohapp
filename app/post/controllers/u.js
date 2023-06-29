let makeTextSearch = function(text){
    // text sentence => {$and: [ {$or:orList}, ...  ]} or { } 
    console.log('function makeTextSearch...');
    console.log('input:', text);
    if ( text == '' ) { console.log("text == ''"); text = {};}
    else {
      console.log("text !== ''");
      var words = text.split(/(\s+)/).filter( e => e.trim().length > 0);
      console.log('split to list:', words);
      var andList = [];
      words.forEach(function(word){
        let orList = [
            {"title":{$regex:word, $options:"i"}},
            {"filename":{$regex:word, $options:"i"}},
            {"text":{$regex:word, $options:"i"}},
            {"keywords":{$regex:word, $options:"i"}},		
          ];	
        andList.push({$or:orList});	
      } );
      text = {$and: andList};
    }
    // console.log('returning text stringify:', JSON.stringify(text));
    return text;
  };

  module.exports = exports = {
      makeTextSearch,
  }