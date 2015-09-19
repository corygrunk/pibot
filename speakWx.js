var request = require('request');
var pico = require('picotts');
var wxEndpoint = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22denver%2C%20co%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"

pico.say("Ok, checking the forecast.", 'en-US', function(err) {
  if (!err) { console.log("Ok, checking the forecast.");  }
});

request(wxEndpoint, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var wx = JSON.parse(body);
    var conditions = wx.query.results.channel.item.condition.text;
    var temp = wx.query.results.channel.item.condition.temp;
    var high = wx.query.results.channel.item.forecast[0].high;
    var low = wx.query.results.channel.item.forecast[0].low;
    var say = "It is currently " + conditions + " and " + temp + " degrees. Today's high is " + high + ", with a low of " + low + ".";
    pico.say(say, 'en-US', function(err) {
      if (!err) {
        console.log(say);
       }
    });
  }
})

