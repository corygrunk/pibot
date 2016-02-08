var tts = require('../lib/tts');

var responses = [
  'I dont understand.'
];

var randomResponse = responses[Math.floor(Math.random() * responses.length)];

var intent = function () {
	tts.say(randomResponse, function () {
		console.log(randomResponse);
	});
}

module.exports.intent = intent;