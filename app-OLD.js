var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor 
var Sound = require('node-aplay');
var sys = require('sys');
var Gpio = require('onoff').Gpio;
var exec = require('child_process').exec;
var child;
var sp = new SerialPort("/dev/ttyACM0", {
  baudrate: 19200,
  parser: serialport.parsers.readline("\n")
});

// GPIO PINS
var ledRed = new Gpio(15, 'out');
var ledGreen = new Gpio(24, 'out');
var ledBlue = new Gpio(25, 'out');

// SENSOR OBJECT - senses.distance & senses.motion
var senses = {};

var ledOn = function (color) {
  if (color === "red") {
    ledRed.writeSync(1); ledGreen.writeSync(0); ledBlue.writeSync(0);
  } else if (color === "green") {
    ledRed.writeSync(0); ledGreen.writeSync(1); ledBlue.writeSync(0);
  } else if (color === "blue") {
    ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(1);
  } else {
    ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(1);
  }
}

var lightsOut = function () {
  ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0); 
}

var blink = function(color, howLong){
  var intervalId = setInterval(function(){
    if (color === "red") {
      if (ledRed.readSync() ^ 1) {
        ledRed.writeSync(1); ledGreen.writeSync(0); ledBlue.writeSync(0);
      } else {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
      }
    } else if (color === "green") {
      if (ledGreen.readSync() ^ 1) {
        ledRed.writeSync(0); ledGreen.writeSync(1); ledBlue.writeSync(0);
      } else {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
      }
    } else if (color === "blue") {
      if (ledBlue.readSync() ^ 1) {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(1);
      } else {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
      }
    } else {
      if (ledBlue.readSync() ^ 1) {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(1);
      } else {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
      }
    }
  }, 250);
  setTimeout(function(){
    clearInterval(intervalId);
    ledGreen.writeSync(0);
    ledBlue.writeSync(0);
    ledRed.writeSync(0);
  }, howLong);
}


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
    }
    //console.log(senses);
  });
});


var exit = function () {
  ledBlue.writeSync(0);
  ledRed.writeSync(0);
  ledGreen.writeSync(0);
  process.exit();
}

process.on('SIGINT', exit);
