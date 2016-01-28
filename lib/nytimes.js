var request = require('request');
var tts = require('../lib/tts');

var version = 3;
var source = 'all';
var section = 'u.s.';
var timePeriod = 24;
var responseFormat = 'json';
var apiKey = process.env.NYT_NEWSWIRE_API || null;
var abstracts = [];

var headlines = function (numResults, callback) {
	var uri = 'http://api.nytimes.com/svc/news/v' + version + '/content/' + source + '/' + section + '/' + timePeriod + '.' + responseFormat + '?api-key=' + apiKey;
	request(uri, function (error, response, body) {
		console.log(response.statusCode + ': ' + response.statusMessage);
	  if (!error && response.statusCode == 200) {
	    console.log(uri) // Show the HTML for the Google homepage.
	    var obj = JSON.parse(body);
	    for (var i = numResults - 1; i >= 0; i--) {
	    	abstracts.push(obj.results[i].abstract);
	    };
	    callback(abstracts);
	  }
	});
}

module.exports.headlines = headlines;