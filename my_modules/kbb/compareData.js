var clone = require('clone');
var log4js = require('log4js');
var logger = log4js.getLogger();

// My modules
var getConsumerData = require('./getConsumerData');
var getExpertData = require('./getExpertData');
var Asem = require('../asem');

var NUMBER_OF_REQUESTS = 2;

var compareData = function(bossId, competitorId, callback) {
  // To store error messages
  var errors = [];
  var result = {};
  // Go async
  var asem = new Asem(function() {
    if(errors.length >= NUMBER_OF_REQUESTS) {
      var error = new Error(errors.reduce( function(prev, curr) { return prev + ". " + curr } ));
      return callback(error);
    }
    callback(null, result);
  }, NUMBER_OF_REQUESTS);

  function onError(err) {
    logger.debug(err.message)
    logger.debug("");
    errors.push(err.message);
    asem.p();
  }

  function mergeScore(boss, competitor) {
    var array = [];
    for(var key in boss) {
      // Boss's score
      var bossScore = boss[key];
      // Competitor's score
      var competitorScore = competitor[key];
      // Create an obj
      var section = {
        // true or false
        win: (bossScore > competitorScore),
        // The name of the section
        name: key,
        boss: bossScore,
        competitor: competitorScore
      }
      array.push(section);
    }
    return array;
  }

  getConsumerData(bossId, competitorId, function(err, data) {
    if (err) return onError(err);

    var boss = clone(data.boss);
    var competitor = clone(data.competitor);

    var mergedScore = mergeScore(boss.ratings, competitor.ratings);
    // Find winning sections
    var winningSections = mergedScore.filter(function(item) { return item.win });
    var wins = winningSections.length;

    result.consumer = {
      wins: wins,
      boss: {
        ratings: boss.ratings,
        details: boss.details
      },
      competitor: {
        ratings: competitor.ratings,
        details: competitor.details
      }
    };

    asem.p();

  });

  getExpertData(bossId, competitorId, function(err, data) {
    if (err) return onError(err);

    var boss = clone(data.boss);
    var competitor = clone(data.competitor);

    var mergedScore = mergeScore(boss.ratings, competitor.ratings);
    // Find winning sections
    var winningSections = mergedScore.filter(function(item) { return item.win });
    var wins = winningSections.length;

    result.expert = {
      wins: wins,
      boss: {
        ratings: boss.ratings
      },
      competitor: {
        ratings: competitor.ratings
      }
    };

    asem.p();

  });

}

module.exports = compareData;
