var sox = require('../lib/sox-play');
var radio = require('../lib/radio');

var intentName = "Radio";

var sounds = [
  'sounds/custom/radio-start.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var radioState = 0;

var intent = function (witIntents, witEntities) {
	console.log();
	var entities = witEntities.on_off[0].value;
	if (witIntents === intentName) {
  	if (entities === 'on') {
			radio.on();
			radioState = 1;
			console.log('Radio On.');
  	} else if (entities === 'off') {
			radio.off(); 
			radioState = 0;
			console.log('Radio Off.');
  	} else {
  		radio.toggle();
  		radioState === 1 ? radioState = 0 : radioState = 1; 
  		console.log('Radio Toggle.');
  	}
  }
}

module.exports.intent = intent;