var http = require('http');
var fs = require('fs');

// My modules
var ftpDownloader = require('./ftpDownloader');

var tcaaDataGetter = function(lookupTableFilePath, lookupTableFileDest, conquestFilePath, conquestFileDest, callback) {
  // Place a new lookup table
  ftpDownloader(lookupTableFilePath, lookupTableFileDest, function(err) {
    if(err) return callback(err);
    // Place a new conquest file
    ftpDownloader(conquestFilePath, conquestFileDest, function(err) {
      if(err) return callback(err);
      callback(null);
    });
  });
}

module.exports = tcaaDataGetter;
