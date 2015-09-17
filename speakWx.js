var request = require('request');
var pico = require('picotts');

request('http://api.openweathermap.org/data/2.5/weather?zip=80207,us', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var wx = JSON.parse(body);
    var say = "It is currently " + wx.weather[0].main + ", and " + wx.weather[0].description;
    pico.say(say, 'en-US', function(err) {
      if (!err) { 
        console.log(say);) 
      }
    });
  }
})