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
var Sound = require('node-aplay');


// SENSOR OBJECT - senses.distance & senses.motion
var senses = {};

var waiting = 0;
var searching = 0;
var locked = 0;
var shutdown = 0;
var radioState = 0;
var serialState = 0;

var radioStart = function () {
  exec('mpc play 1', function(error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
}

var radioStop = function () {
  exec('mpc stop', function(error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
}

var radioToggle = function () {
  if (radioState === 1) {
    radioStop();
    radioState = 0;
  } else {
    radioStart();
    radioState = 1;
  }
}

var checkSerial = function () {
  if (senses.distance && serialState === 0) {
    new Sound('sounds/wakey/wakey1.wav').play();
    serialState = 1
  }
}

var shutdownNow = function () {
  leds.off();
  exec('mpc stop && pkill -f \'app.js\'', function(error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
}

// INIT
console.log("Starting up...");
leds.off();
radioStop();

// TURN ON ARDUINO SERIAL COMMUNITCATION
sp.on('open', function () {
  console.log('Serial connection started.');
  sp.on('data', function(data) {
    if (data.charAt(0) === "{" && data.charAt(data.length - 1) === "}") {
      senses = JSON.parse(data);
    };
    checkSerial();
    states();
  });
});



var reset = function () {
  waiting = 0;
  searching = 0;
  locked = 0;
  shutdown = 0;
  leds.off();
  //console.log('Reset');
}

var statesInterval = function () {
  var logState = ' ///  waiting: ' + waiting + ' / searching: ' + searching + ' / locked: ' + locked + ' / motion: ' + senses.motion + ' / distance: ' + senses.distance;
  // ALL IS QUIET
  if (senses.motion === 0 && waiting === 0 && locked === 0) {
    //console.log('Zzzzzzzz....     ' + logState);
    leds.off();
    waiting = 0;
  }
  // MOTION DETECTED
  if (senses.motion === 1 && waiting === 0 && locked === 0) {
    //console.log('Is someone there?' + logState);
    leds.on(1,0,0);
    waiting = 1;
  }
  if (waiting === 1) {
    waiting = 2;
  }
  // SEARCHING...
  if (waiting >= 2 && waiting <= 10 && locked <= 5) {
    if (senses.distance > 10 && senses.distance < 30) { // SENSE A LOCK COMMAND
      leds.on(0,0,1);
      //console.log('Locking ...      ' + logState);
      locked = locked + 1;
      waiting = 2;
    } else if (senses.distance < 5) { // SENSE A SHUTDOWN COMMAND
      shutdown = shutdown + 1;
      //console.log(shutdown);
      waiting = 2;
    } else {
      //console.log('Searching...     ' + logState);
      leds.off();
      waiting = waiting + 1;
    }
  }
  if (senses.motion === 1 && waiting > 10 && locked < 5) {
    waiting = 2;
  }
  if (senses.motion === 0 && waiting > 10 && locked < 5) {
    reset();
  }
  if (locked === 5) {
    console.log('LOCKED!          ' + logState);
    leds.on(0,1,0);
    radioToggle();
    locked = locked + 1;
  }
  if (locked > 5) {
    leds.on(0,1,0);
    locked = locked + 1;
  }
  if (locked === 30) {
    reset();
  }
  if (shutdown > 0) {
    leds.on(1,0,0);;
  }
  if (shutdown === 30) {
    console.log("SHUTTING DOWN...");
    shutdownNow();
  }
}

var states = function () {
  setTimeout(statesInterval, 5000);
}

// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
