var sox = require('../lib/sox-play');

var intentName = "Trucks";

var sounds = [
  'sounds/custom/monster-trucks.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (intents) {
  if (intents === intentName) {
    sox.play(randomSound);
  }
}

module.exports.intent = intent;