var fs = require('fs');
var leds = require('../lib/leds');
var radio = require('../lib/radio');
var audio = require('../lib/sox-play');
var record = require('node-record-lpcm16');

var globalIntentSounds = {}
globalIntentSounds.voiceCommand = [
  'sounds/custom/what-can-i-do.wav'
];

var file = function (callback) {
  var file = fs.createWriteStream('sample.wav', { encoding: 'binary' });
  if (radio.radioState === 1) { radio.off(); };
  audio.play(globalIntentSounds.voiceCommand[0]);
  setTimeout(function () {
    console.log('Start recording...');
    leds.on(1,1,0);
    audio.play('sounds/boopG.wav');
    setTimeout(function () {
      process.env.NODE_ENV === 'development' ? record.start() : audio.rec('sample.wav', 3);
    }, 250);
  }, 1300);
  setTimeout(function () {
    console.log('Recording complete.');
    if (process.env.NODE_ENV === 'development') {
      record.stop().pipe(file);
    }
    leds.off();
    audio.play('sounds/boopC.wav');
    setTimeout(function () {
      if (radio.radioState === 1) { radio.on(); };
      callback('sample.wav');
    }, 300);
  }, 4300);
}

var quiet = function (callback) {
  var file = fs.createWriteStream('sample.wav', { encoding: 'binary' });
  if (radio.radioState === 1) { radio.off(); };
  setTimeout(function () {
    console.log('Start recording...');
    leds.on(1,1,0);
    audio.play('sounds/boopG.wav');
    setTimeout(function () {
      process.env.NODE_ENV === 'development' ? record.start() : audio.rec('sample.wav', 3);
    }, 250);
  }, 300);
  setTimeout(function () {
    console.log('Recording complete.');
    if (process.env.NODE_ENV === 'development') {
      record.stop().pipe(file);
    }
    leds.off();
    audio.play('sounds/boopC.wav');
    setTimeout(function () {
      if (radio.radioState === 1) { radio.on(); };
      callback('sample.wav');
    }, 300);
  }, 4300);
}


module.exports.file = file;
module.exports.quiet = quiet;