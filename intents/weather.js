var sox = require('../lib/sox-play');
var tts = require('../lib/tts');
var weather = require('weather-js');

var intentName = "WeatherCurrent";

var sounds = [
  'sounds/custom/monster-trucks.wav'
];

var randomSound = sounds[Math.floor(Math.random() * sounds.length)];

var intent = function (intents, entities) {
  if (intents === intentName) {

		var location = 'Denver';

	  if (entities && entities.location) {
	    console.log('Location: ' + entities.location[0].value);
	    location = entities.location[0].value;
	  }
    
    var locationString = ' in ' + location;
    
		var getWeather = function (location, callback) {
		  weather.find({search: location, degreeType: 'F'}, function(err, result) {
		    if(err) console.log(err);
		    if (result && result.length > 0) {
		    	var location = '';
		      var currentTemp = result[0].current.temperature;
		      var currentCond = result[0].current.skytext;
		      callback('It is currently ' + currentCond + ' and ' + currentTemp + ' degrees' + locationString);
		    }
		  });
		}

    getWeather(location, function (wx) {
    	console.log(wx);
      tts.say(wx);
      location = '';
    });
  }
}

module.exports.intent = intent;