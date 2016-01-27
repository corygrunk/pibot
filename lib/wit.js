// NEED TO REMOVE THE INTENT QUERY AND JUST RETURN INTENTS AND ENTITIES
// TO MAKE THIS MORE MODULAR

var wit = require('node-wit');
var fs = require('fs');
var leds = require('../lib/leds');
var intents = require('../intents/intents')
var ACCESS_TOKEN = process.env.WIT_AI_TOKEN || null;

var audio = function (audioFile, callback) {
  console.log('Sending "' + audioFile + '" to Wit...');
  var stream = fs.createReadStream(audioFile);
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
    if (err) console.log("Error: ", err);
    if (res && res.outcomes && res.outcomes.length > 0) {
      //console.log(res);
      var witIntent = res.outcomes[0].intent;
      var witConfidence = res.outcomes[0].confidence;
      var witEntities = '';
      //console.log(res.outcomes[0].entities);
      if (res.outcomes[0].entities) {
        witEntities = res.outcomes[0].entities;
      }
      leds.blink(0,0,1);
      intents.query(witIntent,witConfidence,witEntities);
      callback(witIntent,witConfidence,witEntities);
    } else {
      audio.play('sounds/custom/i-dont-understand.wav');
      console.log('I\'m not sure I understand.');
      callback(witIntent,witConfidence,witEntities);
    }
  });
}

module.exports.audio = audio;