var request = require('request');

var log4js = require('log4js');
var logger = log4js.getLogger();

function serialize(str) {
  if(str) return String(str).toLowerCase().replace(/-|\s|_/g, "");
}

var videoSourceTester = function(urlToSourceFolder, boss, competitor, fileFormat, callback) {

  var url = urlToSourceFolder + serialize(boss) + "-" + serialize(competitor) + "." + fileFormat;

  // logger.debug(url)
  // logger.debug("");

  request(url , function (error, response) {
    // If TCAA image exists
    if (!error && response.statusCode == 200) {
      callback(null, url);
    } else {
      callback(new Error("The video file is not available"));
    }
  });
}

module.exports = videoSourceTester;
