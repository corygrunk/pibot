var sox = require('../lib/sox-play');
var tts = require('../lib/tts');
var wx = require('../lib/weather');
var nest = require('nest-thermostat').init(process.env.NEST_USERNAME, process.env.NEST_PASSWORD);
var radio = require('../lib/radio');

var intentName = "Nest";

var intent = function (witIntents) {
  if (witIntents === intentName) {
    
    if (radio.state === 1) { radio.off(); }
		
		nest.getInfo(process.env.NEST_SERIAL, function(data) {
			tts.say('The heater is currently set to ' + celsiusToFahrenheit(data.target_temperature) + ' degrees');
			console.log('The heater is currently set to ' + celsiusToFahrenheit(data.target_temperature) + ' degrees');
		  //console.log('Currently ' + celsiusToFahrenheit(data.current_temperature) + ' degrees fahrenheit');
		});
    
    setTimeout(function () {
    	if (radio.state === 1) { radio.on(); }
    }, 5000);

		function celsiusToFahrenheit(temp) {
		  return Math.round(temp * (9 / 5.0) + 32.0);
		};
  }
}

module.exports.intent = intent;