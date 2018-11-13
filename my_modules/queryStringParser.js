var BOSS_MANUFACTURER = "Toyota";

// Add a space between main part and "hybrid"
// ?series=camry_hybrid vs ?series=camryhybrid
var hybridFixForAllModels = function(str) {
  if(/hybrid/i.test(str)) {
    return str.replace(/([a-z0-9\-]+)(hybrid.*)/i, "$1_$2");
  } else {
    return str;
  }
}

// Add a space after "prius"
// ?series=prius_c vs ?series=priusc
var priusFixForBossModels = function(str) {
  if(/prius/i.test(str)) {
    return str.replace(/(prius)([a-z0-9\-]+)/i, "$1_$2");
  } else {
    return str;
  }
}

// Replace an underscore to a dash in the manufacturer name
var mercedesFixForCompetitorModels = function(str) {
  if(/mercedes/i.test(str)) {
    return str.replace(/mercedes_benz/i, "mercedes-benz");
  } else {
    return str;
  }
}

// Remove double BMW
var bwmFixForCompetitorModels = function(str) {
  if(/bmw_bmw/i.test(str)) {
    return tr.replace(/_bmw/gi, "_");
  } else {
    return str;
  }
}

// Remove double Chevrolet
var chevroletFixForCompetitorModels = function(str) {
  if(/chevrolet_chevrolet/i.test(str)) {
    return str.replace(/_chevrolet/gi, "_");
  } else {
    return str;
  }
}

var BOSS_FIXES = [
  hybridFixForAllModels,
  priusFixForBossModels
];

var COMPETITOR_FIXES = [
  hybridFixForAllModels,
  mercedesFixForCompetitorModels,
  bwmFixForCompetitorModels,
  chevroletFixForCompetitorModels
];

function applyFixes(fixes, str) {
  var res = str;
  fixes.map(function(foo) {
    res = foo(res);
  });
  return res;
}

var queryStringParser = function(str) {

  // Remove a new extra string
  var string = str.replace(/toyota_/i, "");

  var res = string.split('&');
  var bossSeriesChunks = res[0];
  var competitor = res[1].replace("competitor=", "");

  if (!bossSeriesChunks) return callback(new Error("Boss is not given in the query string"));
  if (!competitor) return callback(new Error("Competitor is not given in the query string"));

  // Apply special conditions to fix mess with names in the URL
  bossSeriesChunks = applyFixes(BOSS_FIXES, bossSeriesChunks);
  competitor = applyFixes(COMPETITOR_FIXES, competitor);

  // Get competitor manufacturer name. Allways the first item
  var competitorManufacturer = competitor.split('_')[0];

  // Get the rest of string after the first item
  var competitorSeriesChunks = competitor.replace(/[0-9a-zA-Z\-]+_/i, "");

  function cleanArray(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    return newArray;
  }

  // Return as an object
  var object = {
    boss: {
      manufacturer: BOSS_MANUFACTURER,
      seriesChunks: cleanArray(bossSeriesChunks.split('_'))
    },
    competitor: {
      manufacturer: competitorManufacturer,
      seriesChunks: cleanArray(competitorSeriesChunks.split('_'))
    }
  }

  return object;

}

module.exports = queryStringParser;
