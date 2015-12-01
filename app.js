var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var sp = new SerialPort("/dev/ttyUSB0", {
  baudrate: 19200,
  parser: serialport.parsers.readline("\n")
});
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var leds = require('./lib/leds');
var states = require('./lib/states');

// SENSOR OBJECT - senses.distance & senses.motion
var senses = {};

// INIT
console.log("Starting up...");
leds.off();


// Move to modules


// TURN ON ARDUINO SERIAL COMMUNITCATION
sp.on('open', function () {
  console.log('Serial connection started.');
  sp.on('data', function(data) {
    if (data.charAt(0) === "{" && data.charAt(data.length - 1) === "}") {
      senses = JSON.parse(data);
    };
    console.log(senses);
    states();
  });
});

// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
