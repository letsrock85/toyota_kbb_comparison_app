var capitalize = require('capitalize');
var multisort = require('multisort');
var log4js = require('log4js');
var logger = log4js.getLogger();

// Remove dashes from a string
function serialize(str) {
    return String(str).toLowerCase().replace(/\-|\s/g, "");
}

function maxYearOnly(arr) {
  var res = [];

  res = arr.sort(function(a, b) {
      if (a.Year > b.Year) return -1;
      if (a.Year < b.Year) return 1;
      return 0;
  });

  // Get the newest
  var minYear = parseInt(res[0].Year);

  res = res.filter(function(obj) {
      var modelYear = parseInt(obj.Year);
      // Leave the newest models only
      return modelYear === minYear;
  });

  return res;
}

function spaceToUnderscore(str) {
  return String(str).replace(/\-|\s/g, "_");
}

function extractAllNumbers(array) {
  var NUMERIC_REGEXP = /[-]{0,1}[\d.]*[\d]+/g;
  var STRING_REGEXP = /[a-zA-Z]+/g;

  var stringToParse = array.join(" ");
  var arrayOfNumbers = stringToParse.match(NUMERIC_REGEXP);
  var arrayOfStrings = stringToParse.match(STRING_REGEXP);

  return arrayOfStrings.concat(arrayOfNumbers).filter(function(n){ return n });
}

function compareTwoArrays(array1, array2) {
  var isOkay = true;
  array1.map(function(key) {
    var isKeyFound = false;

    array2.map(function(sub_key) {
      if(serialize(key) === serialize(sub_key)) isKeyFound = true;
    });

    if(!isKeyFound) isOkay = false;
  });
  return isOkay;
}

// Collect the result
function searchInTheTable(keys, array) {

  var res = [];

  var keys_array = extractAllNumbers(keys);
  keys_array = keys_array.sort();

  res = array.filter(function(object) {

      var search_array = spaceToUnderscore(object.Manufacturer + "_" + object.Model).split("_");
      var search_array = extractAllNumbers(search_array);

      search_array = search_array.sort();

      return compareTwoArrays(keys_array, search_array) && compareTwoArrays(search_array, keys_array);
  });

  if(res.length < 1) {
    throw new Error(capitalize.words(keys.join(" ")) + ' not found in the Kelley Blue Book lookup table');
  }

  return  res;

}

var lookupTableSearcher = function(lookupTable,
                                   bossManuf,
                                   bossChunks,
                                   competitorManuf,
                                   competitorChunks) {

  var tableData;

  // JSON or String
  if(typeof(buffer) === "string") {
    tableData = JSON.parse(lookupTable);
  } else {
    tableData = lookupTable;
  }

  var bossSerachArr = [bossManuf].concat(bossChunks);
  var competitorSerachArr = [competitorManuf].concat(competitorChunks);

  var bossMatches = [];
  var competitorMatches = [];

  try {
      // Match the chunks
      bossMatches = searchInTheTable(bossSerachArr, tableData);
      competitorMatches = searchInTheTable(competitorSerachArr, tableData);

      // Leave only the newest models in the list
      bossMatches = maxYearOnly(bossMatches);
      competitorMatches = maxYearOnly(competitorMatches);

      var criteria = [
        'Model',
        'Style.length',
        'Style.charAt(1)',
        'PrimaryBodyStyle.length',
        'PrimaryBodyStyle.charAt(1)'
      ];

      try {
        multisort(bossMatches, criteria);
      } catch (e) {
        logger.warn(e.message);
        logger.debug("");
      }

      try {
        multisort(competitorMatches, criteria);
      } catch (e) {
        logger.warn(e.message);
        logger.debug("");
      }

      console.log("");
      console.log(competitorMatches[0]);
      console.log("");
      console.log(bossMatches[0]);
      console.log("");


  } catch (err) {
      throw new Error(err.message);
  }

  // Wrap into an object and return
  var object = {
    boss: bossMatches,
    competitor: competitorMatches
  }

  return object;
}

module.exports = lookupTableSearcher;
