var request = require('request');

module.exports = function(callback) {
	request('http://ron-swanson-quotes.herokuapp.com/quotes', function (err, resp, body) {
	  if (!err && resp.statusCode == 200) {
	    var ron = JSON.parse(body);
	    var say = ron.quote;
	    callback(err, say);	  }
	})
}