var clone = require('clone');
var log4js = require('log4js');
var logger = log4js.getLogger();

// My modules
var compareData = require('./compareData');
var Vehicle = require('./models/vehicle');

// Maximum number of iterations
var MAX_ERRORS = 5;

var findKbbComparsion = function (bossArray, competitorArray, callback) {
  // To keep curent amount of errors
  var counter = 0;
  // Turn indicator
  var turn = -1;
  // To store current errors
  var errors = [];
  // Create copies
  var bossArray = bossArray.slice();
  var competitorArray = competitorArray.slice();

  // Handle errors
  function onError(err) {
    logger.debug(err.message);
    logger.debug("");

    // If the the limit is exceeded, error
    if (errors.length >= MAX_ERRORS) {
      errors.push("More than " + MAX_ERRORS + " tries to process Kelley Blue Book IDs");
      return callback(new Error(errors.reduce( function(prev, curr) { return prev + ". " + curr } )));
    }

    // Add to the errors list
    errors.push(err.message);

    // Means that there are just two IDs and they have already triggered an error
    if (bossArray.length == 1 && competitorArray.length == 1) {
      errors.push("No more IDs to process");
      return callback(new Error(errors.reduce( function(prev, curr) { return prev + ". " + curr } )));
    }

    logger.debug("New try...");
    logger.debug("");

    // Clear messages
    errors = [];
    if (turn > 0) {
      if (bossArray.length > 1) {
        // Remove first element from the array
        bossArray.shift();
      } else {
        // If can't shift bossMatch, shift competitorMatch
        competitorArray.shift();
      }
    } else {
      if (competitorArray.length > 1) {
        // Remove first element from the array
        competitorArray.shift();
      } else {
        // If can't shift competitorMatch, shift bossMatch
        bossArray.shift();
      }
    }
    // Switch turn
    turn = turn * -1;
    // Recursion
    foo();
  }

  // Set a recursion
  function foo() {
    // Select a pair of IDs

    var bossCurrent = bossArray[0];
    var competitorCurrent = competitorArray[0];

    var boss = new Vehicle(bossCurrent.VehicleId, bossCurrent.Manufacturer, bossCurrent.Model, bossCurrent.Year);
    var competitor = new Vehicle(competitorCurrent.VehicleId, competitorCurrent.Manufacturer, competitorCurrent.Model, competitorCurrent.Year);

    // Compare
    compareData(boss.id, competitor.id, function(err, data) {
      if (err) return onError(err);

      var expertWins;
      var consumerWins;

      // Count overall score for Expert
      try {
        expertWins = data.expert.boss.ratings.overall > data.expert.competitor.ratings.overall;
      } catch (e) {}

      // Count overall score for Consumer
      try {
        consumerWins = data.consumer.boss.ratings.overall > data.consumer.competitor.ratings.overall;
      } catch (e) {}

      // Condition for winning
      if (!(expertWins || consumerWins)) return onError(new Error("No wins for Expert nor for Consumer"));

      try {
        logger.debug("Expert got " + data.expert.wins + " wins");
        logger.debug("");
      } catch (e) {}

      try {
        logger.debug("Consumer got " + data.consumer.wins + " wins");
        logger.debug("");
      } catch (e) {}

      // Form the response
      var obj = {
        boss: boss,
        competitor: competitor,
        result: data
      };

      // Good to go
      callback(null, obj);
    });

  }

  // Call once
  foo();

}

module.exports = findKbbComparsion;
