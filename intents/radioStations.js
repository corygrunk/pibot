var sox = require('../lib/sox-play');
var tts = require('../lib/tts');
var radio = require('../lib/radio');

var intentName = [ // ORDER SHOULD MATCH MPC PLAYLIST
  "RadioStationNPR",
  "RadioStationOpenAir",
  "RadioStationNext",
  "RadioStationPrev"
]

var sounds = [
  'sounds/custom/radio-npr.wav',
  'sounds/custom/radio-openair.wav'
];

var intent = function (witIntents) {

  for (var i = intentName.length - 1; i >= 0; i--) {
      if (witIntents === intentName[i]) {
        if (witIntents === 'RadioStationPrev' || witIntents === 'RadioStationNext') {
          if (witIntents === 'RadioStationPrev') {
            if (radio.state === 1) { radio.off(); }
            tts.say('Previous station');
            setTimeout(function () {
              radio.prev();
              radio.state = 1
              console.log('Radio previous station.');
            }, 1000);
          } else {
            if (radio.state === 1) { radio.off(); }
            tts.say('Next station');
            setTimeout(function () {
              radio.next();
              radio.state = 1
              console.log('Radio next station.');
            }, 1000);
          }
      } else {
        if (radio.state === 1) { radio.off(); };
        sox.play(sounds[i], function () {
          stationNum = i + 1;
          radio.station(stationNum);
          radio.state = 1;
        }); 
      }
    }
  }
}


module.exports.intent = intent;
