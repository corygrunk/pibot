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
    states();
  });
});

var waiting = 0;
var searching = 0;

var states = function () {
  if (senses.motion === 0 && waiting === 0) {
    console.log(senses.motion + ' Zzzzzzzz.... ' + waiting);
    waiting = 0;
  }
  if (senses.motion === 1 && waiting === 0) {
    waiting = 1;
  }
  if (waiting === 1) {
    console.log(senses.motion + ' //////////////////////////////// Is someone there? ' + waiting);
    waiting = 2;
  }
  if (waiting >= 2 && waiting <= 10) {
    setTimeout(function () {
      console.log(senses.motion + ' //////////////////////////////// Looking... ' + waiting);
      waiting = waiting + 1;
    }, 1000);
  }
  if (waiting > 10) {
    setTimeout(function () {
      waiting = 0;
    }, 1000);
  }
}


// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
