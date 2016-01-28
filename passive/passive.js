var tts = require('../lib/tts');
var wx = require('../lib/weather');
var rec = require('../lib/record');
var wit = require('../lib/wit');
var nyt = require('../lib/nytimes');

var welcome = function () {
	var welcomeMessages = [
	  'Welcome back',
	  'Hello there',
	  'Good day'
	];
	var randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

  tts.say(randomMessage);
  setTimeout(function () {
  	console.log(randomMessage);
      wx.current('Denver', function (wx) {
        console.log(wx);
        tts.say(wx);
      });
  }, 1000);
  setTimeout(function () {
    tts.say('Would you like to hear todays headlines');
    console.log('Would you like to hear todays headlines');
  }, 5500);
  setTimeout(function () {
    rec.quiet(function (file) {
      wit.audioIntent(file, function (data) {
        console.log(data);
        if (data.intent && data.intent === 'Yes') {
          nyt.headlines(function (abstracts) {
            console.log(abstracts);
            var speak = 'Latest Headlines. ';
            for (var i = abstracts.length - 1; i >= 0; i--) {
              abstracts[i];
              i > 0 ? speak = speak + abstracts[i] + ' Next story. ' : speak = speak + abstracts[i];
            };
            tts.say(speak);
          });
        } else if (data.intent && data.intent === 'No') {
          tts.say('Ok. Maybe later.');
          console.log('Ok. Maybe later.');
        } else {
          tts.say('Sorry. I do not understand.');
          console.log('Sorry. I do not understand.');
        }
      });
    });
  }, 8000);
}

module.exports.welcome = welcome;