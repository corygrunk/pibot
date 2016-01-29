var fs = require('fs');
var leds = require('../lib/leds');
var radio = require('../lib/radio');
var sox = require('../lib/sox-play');
var record = require('node-record-lpcm16');

var sounds = [
  'sounds/custom/what-can-i-do.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var state = 0;
module.exports.state = 0;

var file = function (length, callback) {
  module.exports.state = 1;
  var file = fs.createWriteStream('sample.wav', { encoding: 'binary' });
  if (radio.state === 1) { radio.off(); };
  sox.play(randomSound, function () {
    console.log('Start recording...');
    leds.on(1,1,0);
    sox.play('sounds/boopG.wav', function () {
      process.env.NODE_ENV === 'development' ? record.start() : sox.rec('sample.wav', length);
    });  
  });
  setTimeout(function () {
    console.log('Recording complete.');
    if (process.env.NODE_ENV === 'development') {
      record.stop().pipe(file);
    }
    leds.off();
    sox.play('sounds/boopC.wav');
    setTimeout(function () {
      if (radio.state === 1) { radio.on(); };
      callback('sample.wav');
    }, 300);
  module.exports.state = 0;
  }, length * 1000 + 300);
}

var quiet = function (length, callback) {
  var file = fs.createWriteStream('sample.wav', { encoding: 'binary' });
  if (radio.state === 1) { radio.off(); };
  setTimeout(function () {
    console.log('Start recording...');
    leds.on(1,1,0);
    sox.play('sounds/boopG.wav');
    setTimeout(function () {
      module.exports.state = 1;
      process.env.NODE_ENV === 'development' ? record.start() : sox.rec('sample.wav', length);
    }, 250);
  }, 300);
  setTimeout(function () {
    console.log('Recording complete.');
    if (process.env.NODE_ENV === 'development') {
      record.stop().pipe(file);
    }
    leds.off();
    sox.play('sounds/boopC.wav');
    module.exports.state = 0;
    setTimeout(function () {
      if (radio.state === 1) { radio.on(); };
      callback('sample.wav');
    }, 300);
  }, length * 1000 + 300);
}


module.exports.file = file;
module.exports.quiet = quiet;
