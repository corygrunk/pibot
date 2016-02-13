var tts = require('../lib/tts');

var intentName = "SaySomething";

var intent = function (witIntents, witEntities, witText) {
  if (witIntents === intentName) {
    tts.say('Ok. Here goes. ' + witText);
  }
};

module.exports.intent = intent;
