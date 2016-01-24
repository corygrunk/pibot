var sox = require('../lib/sox-play');

var sounds = [
  'sounds/custom/i-dont-understand.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (intents, confidence) {
  if (intents === intentName && confidence > confidenceThresh) {
    sox.play(randomSound);
  }
}

module.exports.intent = intent;