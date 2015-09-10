var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor 
var Sound = require('node-aplay');
var sys = require('sys');
var Gpio = require('onoff').Gpio;
var execFile = require('child_process').execFile;
var child;
var sp = new SerialPort("/dev/ttyACM0", {
  baudrate: 57600,
  parser: serialport.parsers.readline("\n")
});

// GPIO PINS
var ledRed = new Gpio(15, 'out');
var ledGreen = new Gpio(4, 'out');
var ledBlue = new Gpio(25, 'out');

var radioState = 0;

// SOUND FILES
var soundFound = [
  "./sounds/found/found1.wav",
  "./sounds/found/found2.wav",
  "./sounds/found/found3.wav",
  "./sounds/found/found4.wav"
];
var soundGotcha = [
  "./sounds/gotcha/gotcha1.wav",
  "./sounds/gotcha/gotcha2.wav",
  "./sounds/gotcha/gotcha3.wav",
];
var soundLost = [
  "./sounds/lost/lost1.wav",
  "./sounds/lost/lost2.wav",
  "./sounds/lost/lost3.wav"
];
var soundSearching = [
  "./sounds/searching/searching1.wav",
  "./sounds/searching/searching2.wav",
  "./sounds/searching/searching3.wav",
  "./sounds/searching/searching4.wav",
  "./sounds/searching/searching5.wav",
  "./sounds/searching/searching6.wav"
];
var soundSleep = [
  "./sounds/sleep/sleep1.wav",
  "./sounds/sleep/sleep2.wav",
  "./sounds/sleep/sleep3.wav",
  "./sounds/sleep/sleep4.wav"
];
var soundStop = [
  "./sounds/stop/stop1.wav",
  "./sounds/stop/stop2.wav",
];
var soundWakey = [
  "./sounds/wakey/wakey1.wav",
  "./sounds/wakey/wakey2.wav",
];

var getAudio = function(soundArray) {
   return soundArray[Math.floor(Math.random() * soundArray.length)];
}

var toggleRadio = function () {
  if (radioState === 0) {
    execFile('mpc play', function(error, stdout, stderr) {
      console.log( 'Radio toggled.' );
    });        
    radioState = 1;
  } else {
    execFile('mpc stop', function(error, stdout, stderr) {
      console.log( 'Radio toggled.' );
    });        
    radioState = 0;
  }
}

// INIT
ledBlue.writeSync(1); // Turn on LED
execFile('mpc stop', function(error, stdout, stderr) { // Turn off radio
  console.log( 'Radio stopped.' );
});
new Sound(getAudio(soundWakey)).play(); // Play activate sound

// TURN ON ARDUINO SERIAL COMMUNITCATION
sp.on('open', function () {
  console.log('Serial connection started.');
  sp.on('data', function(data) {
    console.log(data);
    console.log(typeOf data);
    // if (data == 2) {
    //   console.log('Hello');
    //   new Sound(getAudio(soundWakey)).play();
    // }

    // if (data == 3) {
    //   console.log('Searching...');
    //   new Sound(getAudio(soundSearching)).play();
    // }

    // if (data == 4) {
    //   console.log('Stop Searching');
    //   new Sound(getAudio(soundStop)).play();
    // }

    // if (data == 5) {
    //   console.log('Found');
    //   new Sound(getAudio(soundFound)).play();
    // }

    // if (data == 6) {
    //   console.log('Lost');
    //   new Sound(getAudio(soundLost)).play();
    // }

    // if (data == 7) {
    //   console.log('Gotcha');
    //   new Sound(getAudio(soundGotcha)).play();
    // }

    // if (data == 8) {
    //   console.log('Wakey');
    //   new Sound(getAudio(soundWakey)).play();
    // }

    // if (data == 9) {
    //   console.log('Sleep');
    //   new Sound(getAudio(soundSleep)).play();
    // }

  });
  sp.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});
