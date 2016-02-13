var tts = require('../lib/tts');

var intentName = "SaySomething";

var intent = function (witIntents, witEntities, witText) {
  if (witIntents === intentName) {
    if (witText === undefined) {
      tts.say('Hmmmm. You first.');
    } else {
      var pattern = /^([\w\-]+)/; // Extract first word.
      var sayText = witText.match(pattern);
      if (sayText[0] === 'Say' || sayText[0] === 'say') {
        tts.say('Ok... ' + witText.slice(3));
      } else {
      tts.say('Ok... ' + witText);
      }
    }
  }
};

module.exports.intent = intent;
