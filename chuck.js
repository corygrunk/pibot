var request = require('request');
var pico = require('picotts');

request('http://api.icndb.com/jokes/random?escape=javascript', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var joke = JSON.parse(body);
    var say = joke.value.joke;
    pico.say(say, 'en-US', function(err) {
      if (!err) { 
        console.log(say);
      }
    });
  }
})