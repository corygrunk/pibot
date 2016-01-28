var request = require('request');
var moment = require('moment');

module.exports = function(callback) {
	request('https://api.nasa.gov/planetary/earth/assets?lon=-104.93&lat=39.75&begin=2014-02-01&api_key=W5RJVKHOevJF1oQdGRFPNljEckv1n8YOqJoLaEXe', function (err, resp, body) {
	  if (!err && resp.statusCode == 200) {
	    var nasaAsset = JSON.parse(body);
	    var assetDate = moment(new Date(nasaAsset.results[0].date)).format("dddd, MMMM D, YYYY");
	    var say = "NASA took a photo of your house on " + assetDate;
	    callback(err, say);
	  }
	})
}
