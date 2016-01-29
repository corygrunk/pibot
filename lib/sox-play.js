var sys = require('sys');
var exec = require('child_process').exec;
var child;
var radio = require('../lib/radio');
var record = require('../lib/record');
var state = 0;
module.exports.state = 0;

var play = function (wav, callback) { // CALLBACK IS OPTIONAL
  if (typeof callback === 'function') {
    if (radio.state === 1 ) { radio.off(); }
    module.exports.state = 1;
    exec('sox --i -D ' + wav, function(error, stdout, stderr) {
      if (error !== null) { console.log('exec error: ' + error); }
      var output = 'stdout: ' + stdout;
      var pattern = /(\b\d+\.\d+)/;
      var length = output.match(pattern);
      exec('play ' + wav, function(error, stdout, stderr) {
        if (error !== null) { console.log('exec error: ' + error); }
      });
      setTimeout(function () {
        console.log('Recording: ' + record.state);
        if (record.state === 0) {
          module.exports.state = 0;
          if (radio.state === 1) { radio.on(); }
          callback();
        } else {
          module.exports.state = 0;
          if (radio.state === 1) { radio.off(); }
          callback();
        }
      }, length[0] * 1000);
    });
  } else {
    exec('play ' + wav, function(error, stdout, stderr) {
      if (error !== null) { console.log('exec error: ' + error); }
    });
  }
}

var rec = function (name, length) {
  module.exports.state = 1;
  exec('arecord -D plughw:1 --duration=' + length + ' -f cd ' + name, function(error, stdout, stderr) {
    if (error !== null) { console.log('exec error: ' + error); }
  });
  setTimeout(function () {
    module.exports.state = 0;
  }, length * 1000);
}

module.exports.play = play;
module.exports.rec = rec;
