var sys = require('sys');
var exec = require('child_process').exec;
var child;
var audio = require('../lib/sox-play');

var say = function (text) {
  if (process.env.NODE_ENV === 'development') {
    exec('say \'' + text + '\'', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  } else {
    exec('pico2wave -w temp.wav \'' + text + '\'', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      audio.play('temp.wav');
    });
  }
}

module.exports.say = say;