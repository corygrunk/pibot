var sox = require('../lib/sox-play');
var tts = require('../lib/tts');
var wx = require('../lib/weather');
var weather = require('weather-js');

var intentName = "WeatherCurrent";

var intent = function (witIntents, witEntities) {
  if (witIntents === intentName) {

		var location = 'Denver';

	  if (witEntities && witEntities.location) {
	    console.log('Location: ' + witEntities.location[0].value);
	    location = witEntities.location[0].value;
	  }
    
    wx.current(location, function (wx) {
    	console.log(wx);
      tts.say(wx);
      location = '';
    });
  }
}

module.exports.intent = intent;