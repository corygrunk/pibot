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
var locked = 0;

var radioStart = function () {
  exec('mpc play 1', function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
}

var radioStop = function () {
  exec('mpc stop', function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
}

var reset = function () {
  waiting = 0;
  searching = 0;
  locked = 0;
  console.log('Reset');
}

var statesInterval = function () {
  var logState = ' ///  waiting: ' + waiting + ' / searching: ' + searching + ' / locked: ' + locked + ' / motion: ' + senses.motion + ' / distance: ' + senses.distance;
  // ALL IS QUIET
  if (senses.motion === 0 && waiting === 0 && locked === 0) {
    console.log('Zzzzzzzz....     ' + logState);
    leds.off();
    waiting = 0;
  }
  // MOTION DETECTED
  if (senses.motion === 1 && waiting === 0 && locked === 0) {
    console.log('Is someone there?' + logState);
    waiting = 1;
  }
  if (waiting === 1) {
    waiting = 2;
  }
  // SEARCHING...
  if (waiting >= 2 && waiting <= 10) {
    if (senses.distance > 10 && senses.distance < 30) {
      leds.on(0,0,1);
      console.log('Locking ...      ' + logState);
      locked = locked + 1;
      waiting = 2;
    } else {
      leds.on(1,0,0);
      console.log('Searching...     ' + logState);
      waiting = waiting + 1;
    }
  }
  if (senses.motion === 1 && waiting > 10) {
    waiting = 2;
  }
  if (senses.motion === 0 && waiting > 10) {
    reset();
  }
  if (locked === 5) {
    console.log('LOCKED!');
    leds.on(0,1,0);
    radioStart();
    reset();
    clearInterval(statesInterval);
    setTimeout(function () {
      leds.off();
      states();
    }, 10000);
  }
}

var states = function () {
  setTimeout(statesInterval, 3000);
}

// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
