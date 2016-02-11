var exec = require('child_process').exec;
var child;
var leds = require('../lib/leds');
var sox = require('../lib/sox-play');
var log = require('../lib/logger');

var intentName = "Shutdown";

var sounds = [
  'sounds/custom/goodbye.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (witIntents) {
  if (witIntents === intentName) {
    log.system('Shutting down.');
    sox.play(randomSound);
    leds.off();
    setTimeout(function () {
      if (process.env.NODE_ENV === 'development') {
        console.log('Shutting down...');
      } else {
        exec('./home/pi/shutdown.sh', function(error, stdout, stderr) {
          if (error !== null) {
            console.log('exec error: ' + error);
          }
        });
      }
    }, 3000);

  }
};

module.exports.intent = intent;
