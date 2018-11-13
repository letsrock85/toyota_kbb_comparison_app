var clone = require('clone');
var fs = require('fs');
var log4js = require('log4js');
var argv = require('yargs').argv;

// My modules
var lookupTableSearcher = require('./my_modules/lookupTableSearcher');
var lookupTableConverter = require('./my_modules/lookupTableConverter');
var conquestFileReader = require('./my_modules/conquestFileReader');
var conquestFileWriter = require('./my_modules/conquestFileWriter');
var queryStringParser = require('./my_modules/queryStringParser');
var findKbbComparsion = require('./my_modules/kbb/findKbbComparsion');
var fuelImagesTester = require('./my_modules/fuel/fuelImagesTester');
var Asem = require('./my_modules/asem');
var tcaaDataGetter = require('./my_modules/tcaa/tcaaDataGetter');
var tcaaDataUploader = require('./my_modules/tcaa/tcaaDataUploader');
var emailer = require('./my_modules/bluehost/emailer');
var videoSourceTester = require('./my_modules/tcaa/videoSourceTester');
var Vehicle = require('./my_modules/fuel/models/vehicle');

var logger = log4js.getLogger();

var constants = require('./constants');

var PATH_TO_INPUT_FOLDER = constants.PATH_TO_INPUT_FOLDER;
var PATH_TO_OUTPUT_FOLDER = constants.PATH_TO_OUTPUT_FOLDER;
var URL_TO_OUTPUT_FOLDER = constants.URL_TO_OUTPUT_FOLDER;
var LOOKUP_XLS = constants.LOOKUP_XLS;
var LOOKUP_JSON = constants.LOOKUP_JSON;
var CONQUEST_FILE = constants.CONQUEST_FILE;
var DATA_FILE = constants.DATA_FILE;
var LOG_FILE = constants.LOG_FILE;
var PATH_TO_TCAA_FOLDER = constants.PATH_TO_TCAA_FOLDER;
var TIMEOUT_DELAY = constants.TIMEOUT_DELAY;
var URL_TO_LP_VIDEOS = constants.URL_TO_LP_VIDEOS;
var VIDEO_FORMAT = constants.VIDEO_FORMAT;

// The first argument defines a region name

var region = argv.region;
var isDebug = argv.d || argv.debug;

if(!region) return logger.fatal("The region name is not given");
if(typeof(region) !== "string") return logger.fatal(("Invalid region name"));

if(isDebug) {
  logger.debug("");
  logger.debug("Runing the programm in debug mode");
}

region = region.toLowerCase();

// Define path to input folder
var inputFolder = __dirname + PATH_TO_INPUT_FOLDER;
// Define path to output folder
var outputFolder = __dirname + PATH_TO_OUTPUT_FOLDER;

// !!! LOCAL FILES !!!

var lookupTableXlsFile = inputFolder + LOOKUP_XLS;
var lookupTableJsonFile = outputFolder + LOOKUP_JSON;

var conquestInputFile = inputFolder + region + '/' + CONQUEST_FILE;
var conquestOutputFile = outputFolder + region + '/' + CONQUEST_FILE;

var dataFile = outputFolder + region + '/' + DATA_FILE;
var logFile = outputFolder + region + '/' + LOG_FILE;

// !!! REMOTE FILES !!!

var conquestFileTcaa = '/' + region + '/html5/' + CONQUEST_FILE;
var lookupTableXlsFileTcaa = PATH_TO_TCAA_FOLDER + "input/" + LOOKUP_XLS;
var lookupTableJsonFileTcaa = PATH_TO_TCAA_FOLDER + "output/" + LOOKUP_JSON;
var dataFileTcaa = PATH_TO_TCAA_FOLDER + "output/" + region + "/" + DATA_FILE;

// !!! URL !!!

var lookupTableJsonFileHttp = URL_TO_OUTPUT_FOLDER + LOOKUP_JSON;
var conquestFileHttp = URL_TO_OUTPUT_FOLDER + region + "/" + CONQUEST_FILE;
var dataFileHttp = URL_TO_OUTPUT_FOLDER + region + "/" + DATA_FILE;

logger.debug("");
logger.debug("Initialized as " + region);
logger.debug("");

// Set counter
var ms = 0;
// Set timer
var interval = setInterval(function() {
  ms += 1000;
}, 1000);

// Set counter
var msBr = 0;
// Set a break up timer
var maxBr = 1000 * 60 * TIMEOUT_DELAY;
// Global variable
var isTimeoutError = false;
// Stops execution
var brInterval = setInterval(function() {
  if(msBr >= maxBr) {
    clearInterval(brInterval);
    isTimeoutError = true;
    return onGlobError(new Error("Time out error"));
  }
  msBr += 1000;
}, 1000);

// If flag -d is give
if(argv.l) {
  // Setup writing to a log file
  logger.debug("Logging to file is enabled");
  logger.debug("");
  log4js.loadAppender('file');
  log4js.addAppender(log4js.appenders.file(logFile));
}

logger.debug("Getting TCAA data...");
logger.debug("");

// Get data from tcaa
tcaaDataGetter(lookupTableXlsFileTcaa, lookupTableXlsFile, conquestFileTcaa, conquestInputFile, function(err) {
  if(err) return onGlobError(err);

  logger.debug("TCAA data received");
  logger.debug("");

  // Convert xlsx to json file and return as an object
  lookupTableConverter(lookupTableXlsFile, function(err, lookupTableData) {
      if(err) return onGlobError(err);

      // Read conquestTargetAudience.csv file and return as object
      conquestFileReader(conquestInputFile, function(err, data) {
        if(err) return onGlobError(err);

        var output = [];
        var array = [];

        // Convert object into an array
        data.map(function(obj) {
          array.push(obj);
        });

        // Check for being not empty
        if(!array.length) return onGlobError(new Error("No data to process"))

        // If argv.max is given
        if(argv.max) {
          if(argv.r) {
            array = array.slice(Math.max(array.length - argv.max))
          } else {
            // Crop the original array of data to speed up the whole thing
            array.splice(argv.max, array.length - argv.max);
          }
        }

        // Length of pairs to compare
        var length = array.length;

        // To store current object
        var newObj;

        function onResult() {
          // Stop recursion if timeout error
          if(isTimeoutError) return;
          // Kick out the first item in the array
          array.shift();
          // More to do - go on
          if(array.length) return foo();
          // Write data
          writeResults(output, lookupTableData);
        }

        function onError(err) {
          logger.error(err.message);
          logger.debug("");
          logger.info(newObj.queryStringValue + " gets compare=false");
          logger.debug("");
          // Push into the output list
          output.push(newObj);
          // Move on to the next item
          onResult();
        }

        function serialize(str) {
          var regex = /[^a-zA-Z0-9\=\-\_\&]+/g;
          var res = String(str).replace(regex, "_");
          return res;
        }

        // Set a recursion. Iterate through all csv items
        function foo() {

          // Save a reference
          newObj = array[0];

          // Update initial value to false
          newObj.variationTargetAudience = "compare=false";

          // Create new properties for results
          newObj.kbb = {};
          newObj.video = {};
          newObj.edmunds = {};

          // Remove unsupported characters from "queryStringValue"
          newObj.queryStringValue = serialize(newObj.queryStringValue);

          logger.debug("Progress: " + array.length + "/" + length);
          logger.debug("");
          logger.debug("Trying " + newObj.queryStringValue);
          logger.debug("");

          var chunksObject;
          var matches;

          try {
            chunksObject = queryStringParser(newObj.queryStringValue);
          } catch (err) {
            return onError(err);
          }

          try {
            matches = lookupTableSearcher(lookupTableData,
                                          chunksObject.boss.manufacturer,
                                          chunksObject.boss.seriesChunks,
                                          chunksObject.competitor.manufacturer,
                                          chunksObject.competitor.seriesChunks);
          } catch (err) {
            // Not found in the KBB's lookup table
            // Save error text
            newObj.kbb = {};
            newObj.kbb.error = err.message;

            // Log
            logger.warn(err.message)
            logger.debug("");

            // Create shortcuts
            var bossManufacturer = chunksObject.boss.manufacturer;
            var bossSeries = chunksObject.boss.seriesChunks[0];
            var competitorManufacturer = chunksObject.competitor.manufacturer;
            var competitorSeries = chunksObject.competitor.seriesChunks.join('-');

            // Try to run as the video option
            runAsVideoOption(bossManufacturer, bossSeries, competitorManufacturer, competitorSeries, function(err, res) {

              if(err) {
                // Save error text
                newObj.video.error = err.message;
                logger.warn(err.message);
                logger.debug("");
                // Return an error
                return onError(new Error("Neither video nor Kelley Blue Book score are available"));
              }

              newObj.bossImageUrl = res.bossImageUrl;
              newObj.competitorImageUrl = res.competitorImageUrl;
              newObj.variationTargetAudience = "compare=video";

              logger.info(newObj.queryStringValue + " gets compare=video");
              logger.debug("");

              newObj.video.boss = res.boss;
              newObj.video.competitor = res.competitor;
              newObj.video.url = res.videoUrl;

              // Save this comparison
              output.push(newObj);

              // Go to the next comparison
              onResult();
            });

            return;
          }

          // Process those the IDs from the KBB table
          findKbbComparsion(matches.boss, matches.competitor, function(err, comparisonResults) {
            if(err) {
              // Save error text
              newObj.kbb.error = err.message;

              logger.warn(err.message);
              logger.debug("");

              // Create shortcuts
              var bossManufacturer = chunksObject.boss.manufacturer;
              var bossSeries = chunksObject.boss.seriesChunks[0];
              var competitorManufacturer = chunksObject.competitor.manufacturer;
              var competitorSeries = chunksObject.competitor.seriesChunks.join('-');
              // Try to run as the video option
              runAsVideoOption(bossManufacturer, bossSeries, competitorManufacturer, competitorSeries, function(err, res) {

                if(err) {
                  logger.warn(err.message);
                  logger.debug("");
                  // Save error text
                  newObj.video.error = err.message;
                  // Return an error
                  return onError(new Error("Neither video nor Kelley Blue Book score are available"));
                }

                // Update the object
                newObj.bossImageUrl = res.bossImageUrl;
                newObj.competitorImageUrl = res.competitorImageUrl;
                newObj.variationTargetAudience = "compare=video";

                logger.info(newObj.queryStringValue + " gets compare=video");
                logger.debug("");

                newObj.video.boss = res.boss;
                newObj.video.competitor = res.competitor;
                newObj.video.url = res.videoUrl;

                // Save this comparison
                output.push(newObj);
                // Go the next comparison
                onResult();
              });
            } else {
              runAsKbbOption(comparisonResults, function(err, res) {
                if(err) {
                  // Save error text
                  newObj.kbb.error = err.message;
                  // Return an error
                  return onError(err)
                }

                newObj.bossImageUrl = res.bossImageUrl;
                newObj.competitorImageUrl = res.competitorImageUrl;
                newObj.variationTargetAudience = "compare=kbb";
                newObj.kbb = comparisonResults;

                logger.info(newObj.queryStringValue + " gets compare=kbb");
                logger.debug("");

                // If applicable
                if(res.videoUrl) {
                  newObj.video.url = res.videoUrl;
                }

                // Save this comparison
                output.push(newObj);
                // Go the next comparison
                onResult();
              });
            }

          });

        }

        // Call the recursion
        foo();

      });

    });

});



function runAsVideoOption(bossManufacturer, bossSeries, competitorManufacturer, competitorSeries, callback) {

  if(!(bossManufacturer || bossSeries)) return callback(new Error("The given Boss model is invalid"));
  if(!(competitorManufacturer || competitorSeries)) return callback(new Error("The given Competitor model is invalid"));

  var res = {};
  var boss = new Vehicle(bossManufacturer, bossSeries);
  var competitor = new Vehicle(competitorManufacturer, competitorSeries);

  // Required
  videoSourceTester(URL_TO_LP_VIDEOS, bossSeries, competitorSeries, VIDEO_FORMAT, function(err, url) {
    if(err) return callback(new Error("Video is not available"));
    // Save the video source URL
    res.videoUrl = url;
    // Get images
    fuelImagesTester(boss, competitor, function(err, images) {
      if(err) return callback(err);
      // Set Fuel images
      res.bossImageUrl = images.boss;
      res.competitorImageUrl = images.competitor;
      res.boss = boss;
      res.competitor = competitor;
      // Return
      callback(null, res);

    });

  });

}

function runAsKbbOption(results, callback) {
  // Create a copy to prevent bugs
  var comparisonResults = clone(results);
  var boss = new Vehicle(results.boss.manufacturer, results.boss.series, results.boss.year);
  var competitor = new Vehicle(results.competitor.manufacturer, results.competitor.series, results.competitor.year);
  var res = {};

  // Get images
  fuelImagesTester(boss, competitor, function(err, images) {
    if(err) return callback(err);

    // Update with Fuel images
    res.bossImageUrl = images.boss;
    res.competitorImageUrl = images.competitor;

    videoSourceTester(URL_TO_LP_VIDEOS, boss.series, competitor.series, VIDEO_FORMAT, function(err, url) {
      if(err) {
        logger.warn(err.message);
        logger.debug("");
      } else {
        // Save the URL
        logger.debug("The video file is available");
        logger.debug("");
        res.videoUrl = url;
      }
      // Return
      callback(null, res);

    });

  });

}

function optimizeJsonOutput(data) {

  // Props to delete
  var PROPS_TO_DELETE = [
    "targetAudience",
    "seriesDisplayName",
    "variationTargetAudience",
    "clientCode"
  ];

  var copy;
  var res = data.map(function(obj) {
    copy = clone(obj);
    PROPS_TO_DELETE.map(function(prop) {
      if(obj.hasOwnProperty(prop)) {
        delete copy[prop];
      }
    });
    return copy;
  });

  return res;
}

function writeResults(output, lookupTableData) {
  var errors = [];
  // Go async
  var asem = new Asem(function() {
    // Some fancy reduce usage
    if(errors.length) return onGlobError(new Error(errors.reduce(function(prev, curr) {
      return prev + ". " + curr;
    })));
    // Good to go
    if(isDebug) {
      onSuccessDebug();
    } else {
      onSuccess();
    }
  }, 4);

  // Debug version
  fs.writeFile(dataFile.substr(0, dataFile.lastIndexOf(".")) + ".dev.json", JSON.stringify(output, null, 4), 'utf8', function(err) {
    if(err) errors.push("Can not save debug data file");
    asem.p();
  });

  // Prod version
  fs.writeFile(dataFile, JSON.stringify(optimizeJsonOutput(output)), 'utf8', function(err) {
    if(err) errors.push("Can not save debug data file");
    asem.p();
  });

  // Save the new lookupTable
  fs.writeFile(lookupTableJsonFile, JSON.stringify(lookupTableData, null, 4), 'utf8', function(err) {
    if(err) errors.push("Can not save a new lookup table file");
    asem.p();
  });

  // Create a new csv file with up to date data
  conquestFileWriter(conquestOutputFile, output, function(err, result) {
    if(err) errors.push("Can not save a new conquest file");
    asem.p();
  });
}

// Reset the timers, log time, exit from the program
function onFinish(output) {
  // Stop the timer
  clearInterval(interval);
  try {
    // Remove a break up timer
    clearInterval(brInterval);
  } catch(e) {
    logger.warn(e.message);
    logger.debug("");
  }
  // Add zero
  function pad(num) {
    return (num.toString().length < 2) ? "0" + num : num;
  }
  var seconds = Math.floor((ms/1000) % 60);
  var minutes = Math.floor((ms/1000/60) % 60);
  var hours = Math.floor((ms/(1000*60*60)) % 24);
  // Log the time
  logger.debug(pad(hours) + ":" + pad(minutes) + ":" + pad(seconds));
  logger.debug("");
  // ???
  // Exit from the program
  // process.exit(0);

  // Just in case exit from the program after ... minutes
  // The delay is for pending logs
  logger.debug("Exit in 1 minute...");
  logger.debug("");
  setTimeout(function() {
    process.exit(0);
  }, 1000 * 60);

}

// For local runs
function onSuccessDebug() {
  logger.debug("Writing to TCAA...");
  logger.debug("");

  logger.debug("Emailing about success");
  logger.debug("");

  emailer.sendSuccess(region, true, function(error) {
    if(error) {
      logger.warn(error.message);
      logger.debug("");
      onFinish();
    } else {
      logger.debug("Message sent");
      logger.debug("");
      onFinish();
    }
  });
}

// On success
function onSuccess() {
  logger.debug("Writing to TCAA...");
  logger.debug("");

  tcaaDataUploader(lookupTableJsonFileHttp,
                   lookupTableJsonFileTcaa,
                   conquestFileHttp,
                   conquestFileTcaa,
                   dataFileHttp,
                   dataFileTcaa,
                   function(err) {

    if(err) return onGlobError(err);

    logger.debug("Emailing about success");
    logger.debug("");

    emailer.sendSuccess(region, false, function(error) {
      if(error) {
        logger.warn(error.message);
        logger.debug("");
        onFinish();
      } else {
        logger.debug("Message sent");
        logger.debug("");
        onFinish();
      }
    });

  });
}

// Throw critical error
function onGlobError(err) {
  logger.fatal(err.message);
  logger.debug("");

  logger.debug("Emailing about failure");
  logger.debug("");

  emailer.sendError(region, isDebug, function(error) {
    if(error) {
      logger.warn(error.message);
      logger.debug("");
      onFinish();
    } else {
      logger.debug("Message sent");
      logger.debug("");
      onFinish();
    }
  });

}
