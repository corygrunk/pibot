var sox = require('../lib/sox-play');
var radio = require('../lib/radio');
var tts = require('../lib/tts');

var intentName = "RadioVolumeDown";

var intent = function (witIntents, witEntities) {
	console.log();
	if (witIntents === intentName) {
    tts.say('Turning volume down');
    setTimeout(radio.volumeDown(5), 2000);
  }
}

module.exports.intent = intent;