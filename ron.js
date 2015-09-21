var request = require('request');

request('http://ron-swanson-quotes.herokuapp.com/quotes', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var ron = JSON.parse(body);
    var say = ron.quote;
    console.log(say);
  }
})
