var request = require('request');
var WX_APIKEY = process.env.OWM_APIKEY || null;

var current = function (location, callback) {
  if (WX_APIKEY === null) {
    callback("OWM_APIKEY environment variable is not provided for weather");
  } else {
    request({
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=metric&APPID=" + WX_APIKEY,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
    }, function(error, response, body){
        if(error) {
          console.log(error);
        } else {
          if (response.statusCode === 200) {
            var wx = JSON.parse(body);
            var currentTempF = Math.round(wx.main.temp * 1.8 + 32);
            var currentConditions = wx.weather[0].description;
            callback('It is currently ' + currentTempF + ' degrees and ' + currentConditions + ' in ' + location);
          }
        }
    });
  }
}

module.exports.current = current;