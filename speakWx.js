var request = require('request');
var pico = require('picotts');

pico.say("Ok, just a second.", 'en-US', function(err) {
  if (!err) { console.log(say);  }
});

request('https://query.yahooapis.com/v1/public/yql?q=select%20item.condition.text%20from%20weather.forec$
  if (!error && response.statusCode == 200) {
    var wx = JSON.parse(body);
    var conditions = wx.query.results.channel.item.condition.text;
    var say = "It is currently " + conditions;
    pico.say(say, 'en-US', function(err) {
      if (!err) {
        console.log(say);
       }
    });
  }
})

