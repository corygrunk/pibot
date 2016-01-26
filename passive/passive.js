var tts = require('../lib/tts');
var wx = require('../lib/weather');

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
}

module.exports.welcome = welcome;