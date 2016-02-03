var exec = require('child_process').exec;
var child;
var sox = require('../lib/sox-play');
var radio = require('../lib/radio');
var state = 0;
module.exports.state = 0;

var say = function (text) {
  module.exports.state = 1;
  if (radio.state === 1 ) { radio.off };
  if (process.env.NODE_ENV === 'development') {
    exec('say \'' + text + '\'', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
    setTimeout(function () {
      module.exports.state = 0;
      if (radio.state === 1 ) { radio.off };
    }, 3000);
  } else {
    exec('pico2wave -w temp.wav \'' + text + '\'', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      sox.play('temp.wav', function () {
        module.exports.state = 0;
      });
    });
  }
}

module.exports.say = say;
