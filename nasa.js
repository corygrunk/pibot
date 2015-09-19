var request = require('request');
var pico = require('picotts');
var moment = require('moment');

request('https://api.nasa.gov/planetary/earth/assets?lon=-104.93&lat=39.75&begin=2014-02-01&api_key=W5RJVKHOevJF1oQdGRFPNljEckv1n8YOqJoLaEXe', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var nasaAsset = JSON.parse(body);
    var assetDate = moment(new Date(nasaAsset.results[0].date)).format("dddd, MMMM D, YYYY");
    var say = "NASA took a photo of your house on " + assetDate;
    pico.say(say, 'en-US', function(err) {
      if (!err) { 
        console.log(say);
      }
    });
  }
})