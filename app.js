var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var sp = new SerialPort("/dev/ttyUSB0", {
  baudrate: 19200,
  parser: serialport.parsers.readline("\n")
});
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var Gpio = require('onoff').Gpio;
var leds = require('./lib/leds.js').Gpio;

// GPIO PINS
var ledRed = new Gpio(15, 'out');
var ledGreen = new Gpio(24, 'out');
var ledBlue = new Gpio(25, 'out');

// SENSOR OBJECT - senses.distance & senses.motion
var senses = {};

// INIT
console.log("Starting up...");
ledBlue.writeSync(0);
ledRed.writeSync(0); 
ledGreen.writeSync(0); 

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
  ledBlue.writeSync(0);
  ledRed.writeSync(0);
  ledGreen.writeSync(0);
  process.exit();
}
process.on('SIGINT', exit);