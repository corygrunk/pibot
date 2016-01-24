var sox = require('../lib/sox-play');

var intentName = "Hello";

var sounds = [
  'sounds/mac-say/hi-01.wav',
  'sounds/mac-say/hi-02.wav',
  'sounds/mac-say/hi-03.wav',
  'sounds/mac-say/hi-04.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (intents) {
  if (intents === intentName) {
    sox.play(randomSound);
  }
}

module.exports.intent = intent;