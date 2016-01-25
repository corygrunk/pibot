var fs = require('fs');
var hello = require('./hello');
var radio = require('./radio');
var radioStations = require('./radioStations');
var radioVolumeDown = require('./radioVolumeDown');
var radioVolumeUp = require('./radioVolumeUp');
var shutdown = require('./shutdown');
var trucks = require('./trucks');
var weather = require('./weather');
var lowConfidence = require('./lowConfidence');

var witIntent;
var witConfidence;
var witEntities;
var confidenceThresh = .5;

var radioState = radio.state; // from intents/radio.js

var query = function (witIntent, witConfidence, witEntities) {
	if (witConfidence > confidenceThresh) {
		hello.intent(witIntent,witEntities);
		radio.intent(witIntent,witEntities);
		radioStations.intent(witIntent,witEntities);
		radioVolumeDown.intent(witIntent,witEntities);
		radioVolumeUp.intent(witIntent,witEntities);
    trucks.intent(witIntent,witEntities);
    shutdown.intent(witIntent,witEntities);
    weather.intent(witIntent,witEntities);
	} else {
		lowConfidence.intent();
	}
}

module.exports.query = query;
module.exports.radioState = radioState;