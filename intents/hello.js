var tts = require('../lib/tts');

var intentName = "Hello";

var sounds = [
  'Hi. how are you.',
  'Hello to you.',
  'Nice to talk to you again.',
  'Hello. I hope youve been well.'
];

var randomPhrase = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (witIntents) {
  if (witIntents === intentName) {
    tts.say(randomPhrase);
  }
}

module.exports.intent = intent;
