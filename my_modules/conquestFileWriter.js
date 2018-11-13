var json2csv = require('json2csv');
var fs = require('fs');

var FIELDS_TO_WRITE = [
  'targetAudience',
  'seriesDisplayName',
  'queryStringValue',
  'variationTargetAudience',
  'clientCode'
];

var conquestFileWriter = function(path, data, callback) {

  var config = {
    data: data,
    del: ';',
    quotes: '',
    fields: FIELDS_TO_WRITE
  }

  try {
    var result = json2csv(config);
  } catch (e) {
    return callback(e);
  }

  fs.writeFile(path, result, function(err) {
    if(err) return callback(err);
    callback(null);
  });

}

module.exports = conquestFileWriter;
