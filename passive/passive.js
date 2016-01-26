var tts = require('../lib/tts');

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
  }, 500);
}

module.exports.welcome = welcome;