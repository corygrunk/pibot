var sys = require('sys');
var exec = require('child_process').exec;
var child;
var leds = require('../lib/leds');
var sox = require('../lib/sox-play');

var intentName = "Shutdown";

var sounds = [
  'sounds/custom/goodbye.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (witIntents) {
  if (witIntents === intentName) {
    sox.play(randomSound);
	  leds.off();
	  setTimeout(function () {
	  	if (process.env.NODE_ENV === 'development') {
	  		console.log('Shutting down...');
	  	} else {
		    exec('mpc stop && shutdown -h now', function(error, stdout, stderr) {
		      if (error !== null) {
		        console.log('exec error: ' + error);
		      }
		    });
		  }
	  }, 3000);

  }
}

module.exports.intent = intent;