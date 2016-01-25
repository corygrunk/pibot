var dotenv = require('dotenv');
  dotenv.config({silent: true});
  dotenv.load();
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var audio = require('./lib/sox-play');
var leds = require('./lib/leds');
var radio = require('./lib/radio');
var record = require('node-record-lpcm16');
var wit = require('node-wit');
var weather = require('weather-js');
var fs = require('fs');

// DEV REQUIRE
if (process.env.NODE_ENV === 'development') {
  var keypress = require('keypress');
  keypress(process.stdin);
}

// PRODUCTION HARDWARE
if (process.env.NODE_ENV !== 'development') {
  var serialport = require("serialport");
  var SerialPort = serialport.SerialPort; // localize object constructor
  var sp = new SerialPort("/dev/ttyUSB0", {
    baudrate: 19200,
    parser: serialport.parsers.readline("\n")
  });
}
var ACCESS_TOKEN = process.env.WIT_AI_TOKEN || null;

var senses = {}; // SENSOR OBJECT - senses.distance & senses.motion
if (process.env.NODE_ENV === 'development') {
  senses = { motion: 0, distance: 141 }
}

var searchDuration = 10;
var minLockDist = 5;
var maxLockDist = 30;

var waiting = 0;
var searching = 0;
var locked = 0;
var recording = 0;
var serialState = 0;

// INTENTS
var intents = require('./intents/intents');

var voiceCommand = function () {
  // RECORD AUDIO
  // SEND TO WIT
  // GET RESPONSE
  // SWITCH TO INTENT STATE
  // WHEN COMPLETE, RESET
}

var globalIntentSounds = {}
globalIntentSounds.voiceCommand = [
  'sounds/custom/what-can-i-do.wav'
];

var getAudioIntent = function (audioFile) {
  console.log('Sending "' + audioFile + '" to Wit...');
  var stream = fs.createReadStream(audioFile);
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
    if (err) console.log("Error: ", err);
    if (res && res.outcomes && res.outcomes.length > 0) {
      console.log(res);
      var witIntent = res.outcomes[0].intent;
      var witConfidence = res.outcomes[0].confidence;
      var witEntities = '';
      console.log(res.outcomes[0].entities);
      if (res.outcomes[0].entities) {
        witEntities = res.outcomes[0].entities;
      }
      leds.blink(0,0,1);
      reset();
      intents.query(witIntent,witConfidence,witEntities);
    } else {
      audio.play('sounds/custom/i-dont-understand.wav');
      console.log('I\'m not sure I understand.');
      reset();
    }
  });
}

var recordAudio = function (callback) {
  var file = fs.createWriteStream('sample.wav', { encoding: 'binary' });
  if (radio.radioState === 1) { radio.off(); };
  audio.play(globalIntentSounds.voiceCommand[0]);
  setTimeout(function () {
    console.log('Start recording...');
    leds.on(1,1,0);
    audio.play('sounds/boopG.wav');
    record.start();
  }, 1300);
  setTimeout(function () {
    console.log('Recording complete.');
    record.stop().pipe(file);
    leds.off();
    audio.play('sounds/boopC.wav');
    setTimeout(function () {
      if (radio.radioState === 1) { radio.on(); };
      callback('sample.wav');
    }, 300);
  }, 4300);
}

var tts = function (text) {
  if (process.env.NODE_ENV === 'development') {
    exec('say \'' + text + '\'', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  } else {
    exec('pico2wave -w temp.wav \'' + text + '\'', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      new Sound('temp.wav').play();
    });
  }
}

var getWeather = function (location, callback) {
  weather.find({search: location, degreeType: 'F'}, function(err, result) {
    if(err) console.log(err);
    if (result && result.length > 0) {
      var currentTemp = result[0].current.temperature;
      var currentCond = result[0].current.skytext;
      callback('It is currently ' + currentCond + ' and ' + currentTemp + ' degrees.');
    }
  });
}

var checkSerial = function () {
  if (senses.distance && serialState === 0) {
    serialState = 1;
    setTimeout(function () {
      console.log('Activated.');
      leds.blink(0,1,0);
      new Sound('sounds/custom/online.wav').play();
    }, 5000);
  }
}

var shutdownNow = function () {
  leds.off();
  setTimeout(function () {
    exec('mpc stop && shutdown -h now', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }, 3000);
}

var reset = function () {
  waiting = 0;
  searching = 0;
  locked = 0;
  shutdown = 0;
  // console.log('Reset');
}

var statesInterval = function () {
  var logState = 'waiting: ' + waiting + ' / searching: ' + searching + ' / locked: ' + locked + ' / recording: ' + recording + ' / motion: ' + senses.motion + ' / distance: ' + senses.distance;
  // console.log(logState);
  if (senses.distance >= minLockDist && senses.distance <= maxLockDist) {
    searching = searching + 1;
  }
  if (searching > 0 && searching < searchDuration && locked === 0) {
    console.log('Locking... ' + searching);
    leds.on(0,0,1);
  }
  if (searching > 0 && searching < searchDuration && senses.distance > maxLockDist) {
    reset();
  }
  if (searching > 0 && searching < searchDuration && senses.distance < minLockDist) {
    reset();
  }
  if (searching === searchDuration) {
    locked = 1;
  }
  if (locked === 1) {
    leds.on(0,1,0);
    locked = 2;
    recordAudio(getAudioIntent);
  }
}

var states = function () {
  setTimeout(statesInterval, 1000);
}

// INIT
console.log("/////// INIT Routine Begin.");
leds.off();
radio.repeat();
radio.volume(90);
radio.off();
// TURN ON ARDUINO SERIAL COMMUNITCATION
if (process.env.NODE_ENV !== 'development') {
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
} else {
  setInterval(states, 300);
}
// DEV MODE // listen for the "keypress" event
if (process.env.NODE_ENV === 'development') {
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.exit();
    }
    if (key && key.name === 'l') {
      locked = 1;
      console.log('Keypress = ');
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
}
console.log("/////// INIT Routine Complete.");

// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
