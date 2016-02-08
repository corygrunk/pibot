var tts = require('../lib/tts');
var radio = require('../lib/radio');

var intentName = [ // ORDER SHOULD MATCH MPC PLAYLIST
  "RadioStationNPR",
  "RadioStationOpenAir",
  "RadioStationNext",
  "RadioStationPrev"
]

var sounds = [
  'Playing N P R',
  'Playing Open Air'
];

var intent = function (witIntents) {
  var stationNum;
  for (var i = intentName.length - 1; i >= 0; i--) {
      if (witIntents === intentName[i]) {
        stationNum = i + 1;
        if (witIntents === 'RadioStationPrev' || witIntents === 'RadioStationNext') {
          if (witIntents === 'RadioStationPrev') {
            if (radio.state === 1) { radio.off(); }
            tts.say('Previous station', function () {
              radio.prev();
              radio.state = 1
              console.log('Radio previous station.');
            });
          } else {
            if (radio.state === 1) { radio.off(); }
            tts.say('Next station', function () {
              radio.next();
              radio.state = 1
              console.log('Radio next station.');              
            });
          }
      } else {
        if (radio.state === 1) { radio.off(); };
        tts.say(sounds[i], function () {
          //stationNum = i + 1;
          console.log(stationNum);
          radio.station(stationNum);
          radio.state = 1;
        }); 
      }
    }
  }
}


module.exports.intent = intent;
