var request = require('request');

module.exports = function(callback) {
  request('http://api.icndb.com/jokes/random?escape=javascript', function (err, resp, body) {
	  if (!err && resp.statusCode == 200) {
	    var joke = JSON.parse(body);
	    var say = joke.value.joke;
	    callback(err, say);
	  }
	})
}