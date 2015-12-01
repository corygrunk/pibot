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
var waiting = false;
while (waiting === false) {
  console.log('Waiting...');
}

// var waiting = function () {
//   var interval = setInterval(function() {
//     if (senses.motion === 1) {
//       console.log('Presence detected.');
//     } else {
//       console.log('Waiting...');    
//     }
//   }, 1000);
// }

// var searchCount = 0;
// var searching = function () {
//   var interval = setInterval(function() {
//     if (senses.motion === 1) {
//       console.log('Presence detected.');
//     } else {
//       console.log('Waiting...');    
//     };
//     searchCount = searchCount++;
//   }, 500);
// }

// waiting();


// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
