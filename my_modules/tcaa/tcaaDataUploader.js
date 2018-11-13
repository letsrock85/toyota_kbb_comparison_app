var log4js = require('log4js');
var logger = log4js.getLogger();

// My modules
var phpSyncGetter = require('./phpSyncGetter');

var tcaaDataUploader = function(
                                lookupTableFileUrl,
                                lookupTableFileDest,
                                conquestFileUrl,
                                conquestFileDest,
                                dataFileUrl,
                                dataFileDest,
                                callback) {

  logger.debug("Uploading a new lookup table...")
  logger.debug("");

  phpSyncGetter(lookupTableFileUrl, lookupTableFileDest, function(err) {
    if(err) return callback(err);
    logger.debug("Done")
    logger.debug("");

    logger.debug("Uploading a new conquest file...")
    logger.debug("");

    phpSyncGetter(conquestFileUrl, conquestFileDest, function(err) {
      if(err) return callback(err);
      logger.debug("Done")
      logger.debug("");

      logger.debug("Uploading a new data file...")
      logger.debug("");

      phpSyncGetter(dataFileUrl, dataFileDest, function(err) {
        if(err) return callback(err);
        logger.debug("Done")
        logger.debug("");

        callback(null);

      });

    });

  });

}

module.exports =  tcaaDataUploader;
