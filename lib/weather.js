var weather = require('weather-js');

var current = function (location, callback) {
  weather.find({search: location, degreeType: 'F'}, function(err, result) {
    if(err) console.log(err);
    if (result && result.length > 0) {
    	var pattern = /^[^,]+/;
    	var locationString = result[0].current.observationpoint.match(pattern);
      var currentTemp = result[0].current.temperature;
      var currentCond = result[0].current.skytext;
      callback('It is currently ' + currentCond + ' and ' + currentTemp + ' degrees in ' + locationString);
    }
  });
}

module.exports.current = current;