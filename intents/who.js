var tts = require('../lib/tts');

var intentName = "Who";

var sounds = [
  'I am Pie Bot. I am an observational companion robot. I am also a fan of pizza.',
  'I am Pie Bot. I am an observational companion robot. Do not worry. My phasers are always set to stun.',
  'I am Pie Bot. I am an observational companion robot. I am not the droid you are looking for.'
];

var randomPhrase = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (witIntents) {
  if (witIntents === intentName) {
    tts.say(randomPhrase);
  }
};

module.exports.intent = intent;
