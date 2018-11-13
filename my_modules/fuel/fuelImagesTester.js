var request = require('request');
var log4js = require('log4js');
var logger = log4js.getLogger();

// My modules
var fuelImageProcessor = require('./fuelImageProcessor');
var Asem = require('../asem');
var URL_TO_LP_IMAGES = require('../../constants').URL_TO_LP_IMAGES;

// Shot code is used for specifing vehicle image angle
var SHOT_CODE_RIGHT = '159';
var SHOT_CODE_LEFT = '089';

function serialize(str) {
  return String(str).toLowerCase().replace(/-|\s|_/g, "");
}

var fuelImagesTester = function(boss, competitor, callback) {
  var errors = [];
  var result = {};

  // Go async
  var asem = new Asem(function() {
    if(errors.length) return callback(new Error(errors.reduce( function(prev, curr) { return prev + ". " + curr } )));
    callback(null, result);
  }, 2);

  function onError(err) {
    errors.push(err.message);
    asem.p();
  }

  // Try TCAA image first

  var imageUrl = URL_TO_LP_IMAGES + serialize(boss.series) + ".png";

  request(imageUrl, function(error, response) {
    // If TCAA image exists
    if (!error && response.statusCode == 200) {
      result.boss = imageUrl;
      logger.debug("Image URL for " + boss.series + " " + boss.year + " " + boss.manufacturer  + " received from TCAA");
      logger.debug("");
      asem.p();
      return;
    }
    logger.debug("TCAA image is not available");
    logger.debug("");
    // Try to Boss
    fuelImageProcessor(boss, SHOT_CODE_RIGHT, function(err, response) {
      if(err) return onError(err);
      result.boss = response;
      asem.p();
    });
  });

  // Try the competitor
  fuelImageProcessor(competitor, SHOT_CODE_LEFT, function(err, response) {
    if(err) return onError(err);
    result.competitor = response;
    asem.p();
  });
}

module.exports = fuelImagesTester;
