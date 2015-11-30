var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var sp = new SerialPort("/dev/ttyUSB0", {
  baudrate: 19200,
  parser: serialport.parsers.readline("\n")
});
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var Led = require('./lib/leds.js').Gpio;
var leds = new Led();

// SENSOR OBJECT - senses.distance & senses.motion
var senses = {};

// INIT
console.log("Starting up...");
leds.on(1,0,0);

// TURN ON ARDUINO SERIAL COMMUNITCATION
sp.on('open', function () {
  console.log('Serial connection started.');
  sp.on('data', function(data) {
    if (data.charAt(0) === "{" && data.charAt(data.length - 1) === "}") {
      senses = JSON.parse(data);
    };
    console.log(senses);
    if (senses.distance < 20) {
      leds.on(1,1,0);
    } else {
      leds.off;
    };
  });
});

// EXIT
var exit = function () {
  // need lights out
  process.exit();
}
process.on('SIGINT', exit);