var sys = require('sys');
var exec = require('child_process').exec;
var child;

var play = function (wav, callback) { // CALLBACK IS OPTIONAL
  if (typeof callback === 'function') {
    exec('sox --i -D ' + wav, function(error, stdout, stderr) {
      if (error !== null) { console.log('exec error: ' + error); }
      var output = 'stdout: ' + stdout;
      var pattern = /(\b\d+\.\d+)/;
      var length = output.match(pattern);
      exec('play ' + wav, function(error, stdout, stderr) {
        if (error !== null) { console.log('exec error: ' + error); }
      });
      setTimeout(function () {
        callback();
      }, length[0] * 1000);
    });
  } else {
    exec('play ' + wav, function(error, stdout, stderr) {
      if (error !== null) { console.log('exec error: ' + error); }
    });
  }
}

var rec = function (name, length) {
  exec('arecord -D plughw:1 --duration=' + length + ' -f cd ' + name, function(error, stdout, stderr) {
    if (error !== null) { console.log('exec error: ' + error); }
  });
}

module.exports.play = play;
module.exports.rec = rec;
