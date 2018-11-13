var Client = require('ftp');
var fs = require('fs');

var CONNECTION_PROPERTIES = {
  host: "0368b9e.netsolvps.com",
  user: "wdtcaaftp",
  password: "Wd@2016",
  port: 21
};

var ftpDownloader = function(path, dest, callback) {

  var c = new Client();
  var isError = false;

  c.connect(CONNECTION_PROPERTIES);

  // Once the connection is established
  c.on('ready', function() {
    if(isError) return;
    c.get(path, function(err, stream) {
      if(err) return callback(err);
      stream.once('close', function() {
        c.end();
      });
      stream.pipe(fs.createWriteStream(dest, {flags: 'w'}));
    });
  });

  c.on('error', function() {
    isError = true;
    callback(new Error("Cannot connect to TCAA"));
  });

  c.on("end", function(){
    callback(null);
  });

}

module.exports = ftpDownloader;
