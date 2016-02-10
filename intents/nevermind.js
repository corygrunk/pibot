var tts = require('../lib/tts');

var intentName = "Nevermind";

var sounds = [
  'No problem.',
  'Dont worry about it.',
  'Ok maybe next time.',
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (witIntents) {
  if (witIntents === intentName) {
    tts.say(randomSound);
  }
}

module.exports.intent = intent;
