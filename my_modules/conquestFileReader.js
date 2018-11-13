var csvtojson = require("csvtojson");

var conquestFileReader = function(path, callback) {
  var arr = [];

  csvtojson({ delimiter: ';' })
    .fromFile(path)
    .on('json', function(jsonObj) {
      // Push each line after conversion into the arr
      arr.push(jsonObj);
    })
    .on('done', function(err) {
      if(err) return callback(err);
      // Good to go
      callback(null, arr);
    })
}

module.exports = conquestFileReader;
