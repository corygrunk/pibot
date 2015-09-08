var http = require('http');
var Sensor = require('pi-pir-sensor');

var sensor = new Sensor({
    // pin number must be specified 
    pin: 18,
 
    // loop time to check PIR sensor, defaults to 1.5 seconds 
    loop: 1500
});

sensor.on('movement', function () {
    console.log("who's there?"); 
});

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end("Hello Http");
});
server.listen(5000);