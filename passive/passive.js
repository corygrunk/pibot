var tts = require('../lib/tts');
var wx = require('../lib/weather');
var rec = require('../lib/record');
var wit = require('../lib/wit');

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
      wit.audio(file, function (data) {
        if (data && data === 'Yes') {
          tts.say('Fetching headlines.');
          console.log('Fetching headlines.');
        } else if (data && data === 'No') {
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