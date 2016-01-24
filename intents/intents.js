var hello = require('./hello');
var trucks = require('./trucks');
var radio = require('./radio');
var lowConfidence = require('./lowConfidence');

var confidenceThresh = .5;

var query = function (witIntent, witConfidence, witEntities) {
	if (witConfidence > confidenceThresh) {
		hello.intent(witIntent,witEntities);
		trucks.intent(witIntent,witEntities);
		radio.intent(witIntent,witEntities);
	} else {
		lowConfidence.intent();
	}
}

module.exports.query = query;