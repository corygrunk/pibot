var sox = require('../lib/sox-play');
var tts = require('../lib/tts');
var radio = require('../lib/radio');

var intentName = "Radio";

var responses = {
	"on": [
  	"Turning the radio on."
	],
	"off": [
		"Turning the radio off."
	],
	"toggle": [
		"Toggling the radio."
	]
}

var intent = function (witIntents, witEntities) {
	if (witIntents === intentName) {
		if (witEntities.on_off) {
			var entities = witEntities.on_off[0].value;
			if (entities === 'on') {
				tts.say(responses.on[0], function () {
					radio.on();
					radio.state = 1;
					console.log('Radio On (state: ' + radio.state + ')');
				});
	  	} else if (entities === 'off') {
	  		tts.say(responses.off[0], function () {
					radio.off(); 
					radio.state = 0;
					console.log('Radio Off (state: ' + radio.state + ')');
				});
	  	}
		} else {
			tts.say(responses.toggle[0], function () {
	  		radio.toggle();
	  		console.log('Radio Toggle (state: ' + radio.state + ')');
	  	});
  	}
  }
}

module.exports.intent = intent;
