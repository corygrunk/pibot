var wit = require('node-wit');
var fs = require('fs');
var leds = require('../lib/leds');
var intents = require('../intents/intents')
var state = 0;
var ACCESS_TOKEN = process.env.WIT_AI_TOKEN || null;

var audioIntent = function (audioFile, callback) {
	state = 1;
	leds.on(1,0,0);
  var witObj = {};
  var stream = fs.createReadStream(audioFile);
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
	  if (err) console.log("Error: ", err);
	  if (res && res.outcomes && res.outcomes.length > 0) {
	  	witObj.intent = res.outcomes[0].intent;
	  	witObj.confidence = res.outcomes[0].confidence;
	  	res.outcomes[0].entities ? witObj.entities = res.outcomes[0].entities : witObj.entities = null;
	  	console.log(witObj);
		  callback(witObj);
		  state = 0;
	  	leds.blink(1,0,0);
	  } else {
		  console.log(witObj);
	  	callback(witObj);
	  	state = 0;
	  	leds.blink(1,0,0);
	  }
	});
}

var textIntent = function (textString, callback) {
	state = 1;
  var witObj = {};
  wit.captureTextIntent(ACCESS_TOKEN, textString, function (err, res) {
	  if (err) console.log("Error: ", err);
	  if (res && res.outcomes && res.outcomes.length > 0) {
	  	witObj.intent = res.outcomes[0].intent;
	  	witObj.confidence = res.outcomes[0].confidence;
	   	res.outcomes[0].entities ? witObj.entities = res.outcomes[0].entities : witObj.entities = null;
	  	console.log(witObj);
		  callback(witObj);
		  state = 0;
	  	leds.blink(1,0,0);
	  } else {
		  console.log(witObj);
	  	callback(witObj);
	  	state = 0;
	  	leds.blink(1,0,0);
	  }
  });
}

module.exports.audioIntent = audioIntent;
module.exports.textIntent = textIntent;
module.exports.state = state;
