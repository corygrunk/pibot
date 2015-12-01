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

// SENSOR OBJECT - senses.distance & senses.motion
var senses = {};

// INIT
console.log("Starting up...");
leds.off();

// TURN ON ARDUINO SERIAL COMMUNITCATION
sp.on('open', function () {
  console.log('Serial connection started.');
  sp.on('data', function(data) {
    if (data.charAt(0) === "{" && data.charAt(data.length - 1) === "}") {
      senses = JSON.parse(data);
    };
    console.log(senses);
  });
});

// STATES
var waiting = setInterval(function() {
  if (senses.motion === 1) {
    console.log('Presence detected.');
  } else {
    console.log('Waiting...');    
  }
}, 1000);
var presence = setInterval(function() {
  console.log('Presence');
}, 1000);
var locking = setInterval(function() {
  console.log('Locking');
}, 1000);
var locked = setInterval(function() {
  console.log('Locked');
}, 1000);
// START UP
waiting();


// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
