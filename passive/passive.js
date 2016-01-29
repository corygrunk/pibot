var tts = require('../lib/tts');
var wx = require('../lib/weather');
var rec = require('../lib/record');
var wit = require('../lib/wit');
var nyt = require('../lib/nytimes');
var welcomeOccurrence = 0;

var welcome = function () {
  var welcomeMessages = [
    'Welcome back',
    'Hello there',
    'Good day'
  ];
  var randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  
  if (welcomeOccurrence > 1) {
      welcomeOccurrence = 0;
  }
  
  if (welcomeOccurrence === 0) {
    wx.current('Denver', function (wx) {
      tts.say(randomMessage + '. ' + wx);
      console.log(randomMessage + '. ' + wx);
    });
  }
  if (welcomeOccurrence === 1) {
    nyt.headlines(3, function (abstracts) {
      var speak = 'Latest Headline. ';
      for (var i = abstracts.length - 1; i >= 0; i--) {
        abstracts[i];
        i > 0 ? speak = speak + abstracts[i] + ' Next story. ' : speak = speak + abstracts[i];
      };
      tts.say(randomMessage + '. ' + speak);
      console.log(randomMessage + '. ' + speak);
    });
    welcomeOccurrence = welcomeOccurrence + 1;
  } 
  // YES/NO EXAMPLE TO PLAY HEADLINES - ITS KIND OF ANNOYING IN PRACTICE
  // setTimeout(function () {
  //   tts.say('Would you like to hear todays headlines');
  //   console.log('Would you like to hear todays headlines');
  // }, 5500);
  // setTimeout(function () {
  //   rec.quiet(2, function (file) {
  //     wit.audioIntent(file, function (data) {
  //       console.log(data);
  //       if (data.intent && data.intent === 'Yes') {
  //         nyt.headlines(3, function (abstracts) {
  //           var speak = 'Latest Headlines. ';
  //           for (var i = abstracts.length - 1; i >= 0; i--) {
  //             abstracts[i];
  //             i > 0 ? speak = speak + abstracts[i] + ' Next story. ' : speak = speak + abstracts[i];
  //           };
  //           tts.say(speak);
  //           console.log(speak);
  //         });
  //       } else if (data.intent && data.intent === 'No') {
  //         tts.say('Ok. Maybe later.');
  //         console.log('Ok. Maybe later.');
  //       } else {
  //         tts.say('Sorry. I do not understand.');
  //         console.log('Sorry. I do not understand.');
  //       }
  //     });
  //   });
  // }, 8000);
}

module.exports.welcome = welcome;
