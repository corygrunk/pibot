var sox = require('../lib/sox-play');
var radio = require('../lib/radio');

var intentName = "Radio";

var sounds = [
  'sounds/custom/radio-start.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (witIntents, witEntities) {
	console.log();
	if (witIntents === intentName) {
		if (witEntities.on_off && witEntities.on_off > 0) {
			var entities = witEntities.on_off[0].value;
			if (entities === 'on') {
				radio.on();
				radio.state = 1;
				console.log('Radio On (state: ' + radio.state + ')');
	  	} else if (entities === 'off') {
				radio.off(); 
				radio.state = 0;
				console.log('Radio Off (state: ' + radio.state + ')');
	  	}
		} else {
  		radio.toggle();
  		radio.state === 1 ? radio.state = 0 : radio.state = 1; 
  		console.log('Radio Toggle (state: ' + radio.state + ')');
  	}
  }
}

module.exports.intent = intent;