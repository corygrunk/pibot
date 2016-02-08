var wit = require('node-wit');
var fs = require('fs');
var leds = require('../lib/leds');
var tts = require('../lib/tts');
var intents = require('../intents/intents');
var log = require('../lib/logger');
var ACCESS_TOKEN = process.env.WIT_AI_TOKEN || null;
var state = 0;

module.exports.state = 0;

var audioIntent = function (audioFile, callback) {
  //tts.say('Just a second.');  
  module.exports.state = 1;
  leds.on(1,0,1);
  var witObj = {};
  var stream = fs.createReadStream(audioFile);
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
    if (err) console.log("Error: ", err);
    if (res && res.outcomes && res.outcomes.length > 0) {
      log.command(res.outcomes[0]._text);
      witObj.intent = res.outcomes[0].intent;
      witObj.confidence = res.outcomes[0].confidence;
      res.outcomes[0].entities ? witObj.entities = res.outcomes[0].entities : witObj.entities = null;
      console.log(witObj);
      callback(witObj);
      module.exports.state = 0;
      leds.blink(1,0,1);
    } else {
      console.log(witObj);
      callback(witObj);
      module.exports.state = 0;
      leds.blink(1,0,1);
    }
  });
}

var textIntent = function (textString, callback) {
  module.exports.state = 1;
  var witObj = {};
  wit.captureTextIntent(ACCESS_TOKEN, textString, function (err, res) {
    if (err) console.log("Error: ", err);
    console.log(res);
    if (res && res.outcomes && res.outcomes.length > 0) {
      log.command(res.outcomes[0]._text);
      witObj.intent = res.outcomes[0].intent;
      witObj.confidence = res.outcomes[0].confidence;
       res.outcomes[0].entities ? witObj.entities = res.outcomes[0].entities : witObj.entities = null;
      console.log(witObj);
      callback(witObj);
      module.exports.state = 0;
      leds.blink(1,0,1);
    } else {
      console.log(witObj);
      callback(witObj);
      module.exports.state = 0;
      leds.blink(1,0,1);
    }
  });
}

module.exports.audioIntent = audioIntent;
module.exports.textIntent = textIntent;

