var request = require('request');

request('http://api.icndb.com/jokes/random?escape=javascript', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var joke = JSON.parse(body);
    var say = joke.value.joke;
    console.log(say);
  }
})
