var sys = require('sys');
var exec = require('child_process').exec;
var child;

var play = function (wav) {
  exec('play ' + wav, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

var rec = function (name, length) {
  exec('arecord -D plughw:1 --duration=' + length + '3 -f cd ' + name, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

module.exports.play = play;
module.exports.rec = rec;