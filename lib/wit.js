var wit = require('node-wit');
var fs = require('fs');
var leds = require('../lib/leds');
var intents = require('../intents/intents')
var ACCESS_TOKEN = process.env.WIT_AI_TOKEN || null;

var audioIntent = function (audioFile, callback) {
	var witObj = {};
  var stream = fs.createReadStream(audioFile);
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
	  if (err) console.log("Error: ", err);
	  if (res && res.outcomes && res.outcomes.length > 0) {
	  	witObj.intent = res.outcomes[0].intent;
	  	witObj.confidence = res.outcomes[0].confidence;
	    res.outcomes[0].entities ? witObj.entities = res.outcomes[0].entities : witObj.entities = null;
	  	callback(witObj);
	  	leds.blink(0,0,1);
	  } else {
	  	callback(witObj);
	  	leds.blink(0,0,1);
	  }
	});
}

var textIntent = function (textString, callback) {
	var witObj = {};
  wit.captureTextIntent(ACCESS_TOKEN, textString, function (err, res) {
	  if (err) console.log("Error: ", err);
	  if (res && res.outcomes && res.outcomes.length > 0) {
	  	witObj.intent = res.outcomes[0].intent;
	  	witObj.confidence = res.outcomes[0].confidence;
	    res.outcomes[0].entities ? witObj.entities = res.outcomes[0].entities : witObj.entities = null;
	  	callback(witObj);
	  	leds.blink(0,0,1);
	  } else {
	  	callback(witObj);
	  	leds.blink(0,0,1);
	  }
  });
}

module.exports.audioIntent = audioIntent;
module.exports.textIntent = textIntent