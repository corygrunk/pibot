
var fs = require('fs');
var hello = require('./hello');
var trucks = require('./trucks');
var radio = require('./radio');
var lowConfidence = require('./lowConfidence');

var witIntent;
var witConfidence;
var witEntities;
var confidenceThresh = .5;

var radioState = radio.state; // from intents/radio.js

var audioGet = function (file, callback) {
  console.log("Sending audio to Wit...");
  var stream = fs.createReadStream(file);
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
    if (err) console.log("Error: ", err);
    if (res && res.outcomes && res.outcomes.length > 0) {
      console.log(res);
      witIntent = res.outcomes[0].intent;
      witConfidence = res.outcomes[0].confidence;
      if (res.outcomes[0].entities) {
        witEntities = res.outcomes[0].entities;
      }
      callback(witIntent,witConfidence,witEntities);
    } else {
      callback(null);
    }
  });
}

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
module.exports.radioState = radioState;