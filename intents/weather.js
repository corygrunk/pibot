var sox = require('../lib/sox-play');
var tts = require('../lib/tts');
var wx = require('../lib/weather');
var weather = require('weather-js');

var intentName = "WeatherCurrent";

var intent = function (intents, entities) {
  if (intents === intentName) {

		var location = 'Denver';

	  if (entities && entities.location) {
	    console.log('Location: ' + entities.location[0].value);
	    location = entities.location[0].value;
	  }
    
    wx.current(location, function (wx) {
    	console.log(wx);
      tts.say(wx);
      location = '';
    });
  }
}

module.exports.intent = intent;