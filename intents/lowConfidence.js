var sox = require('../lib/sox-play');

var sounds = [
  'sounds/custom/i-dont-understand.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function () {
	sox.play(randomSound, function () {
		console.log(randomSound);
	});
}

module.exports.intent = intent;