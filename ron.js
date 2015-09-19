var request = require('request');
var pico = require('picotts');

request('http://ron-swanson-quotes.herokuapp.com/quotes', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var ron = JSON.parse(body);
    var say = ron.quote;
    pico.say(say, 'en-US', function(err) {
      if (!err) { 
        console.log(say);
      }
    });
  }
})