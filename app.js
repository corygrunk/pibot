var dotenv = require('dotenv');
  dotenv.config({silent: true});
  dotenv.load();
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var audio = require('./lib/sox-play');
var leds = require('./lib/leds');
var radio = require('./lib/radio');
var sox = require('sox');
var Sound = require('node-aplay');
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
var radioState = 0;

var soundsHello = new Sound('sounds/custom/hello.wav');
var soundsShutdown = new Sound('sounds/custom/goodbye.wav');
var soundsRadioOpenair = new Sound('sounds/custom/radio-openair.wav');
var soundsRadioNPR = new Sound('sounds/custom/radio-npr.wav');
var soundsRadioWWOZ = new Sound('sounds/custom/radio-wwoz.wav');
var soundsRadioNext = new Sound('sounds/boop.wav');
var soundsRadioPrev = new Sound('sounds/boop.wav');
var soundsRadioVolumeUp = new Sound('sounds/boop.wav');
var soundsRadioVolumeDown = new Sound('sounds/boop.wav');

var getIntent = function () {
  console.log("Sending audio to Wit...");
  var stream = fs.createReadStream('sample.wav');
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
    if (err) console.log("Error: ", err);
    if (res && res.outcomes && res.outcomes.length > 0) {
      var intent = res.outcomes[0].intent;
      var confidence = res.outcomes[0].confidence;
      console.log(res);
      leds.blink(0,0,1);
      reset();
      if (intent === "Hello" && confidence > .5) {
        audio.play('sounds/custom/hello.wav');
      }
      if (intent === "Trucks" && confidence > .5) {
        audio.play('sounds/custom/monster-trucks.wav');
      }
      // if (intent === "Radio" && confidence > .5) {
      //   if (res.outcomes[0].entities && res.outcomes[0].entities.length > 0) {
      //     if (res.outcomes[0].entities.on_off[0].value === 'on') { radio.on(); radioState = 1; console.log('Radio On.') }
      //     if (res.outcomes[0].entities.on_off[0].value === 'off') { radio.off(); radioState = 0; console.log('Radio Off.') }
      //   } else { 
      //     radio.toggle();
      //     radioState === 1 ? radioState = 0 : radioState = 1; 
      //     console.log('Radio Toggle.');
      //   }
      // } else if (intent === "OpenAir" && confidence > .5) {
      //   if (radioState === 1) { radio.off(); };
      //   setTimeout(function () { soundsRadioOpenair.play(); }, 400);
      //   soundsRadioOpenair.on('complete', function () {
      //     radio.station(2);
      //     radioState = 1;
      //     console.log('Radio play OpenAir.');
      //     if (radioState === 1) { radio.on(); };
      //   });
      // } else if (intent === "NPR" && confidence > .5) {
      //   if (radioState === 1) { radio.off(); };
      //   setTimeout(function () { soundsRadioNPR.play(); }, 400);
      //   soundsRadioNPR.on('complete', function () {
      //      radio.station(1);
      //      radioState = 1
      //      console.log('Radio play NPR.');
      //      if (radioState === 1) { radio.on(); };
      //   });
      // } else if (intent === "WWOZ" && confidence > .5) {
      //   if (radioState === 1) { radio.on(); };
      //   setTimeout(function () { soundsRadioWWOZ.play(); }, 400);
      //   soundsRadioWWOZ.on('complete', function () {
      //      radio.station(4);
      //      radioState = 1;
      //      console.log('Radio play WWOZ.');
      //      if (radioState === 1) { radio.on(); };
      //   });
      // } else if (intent === "RadioNext" && confidence > .5) {
      //   if (radioState === 1) { radio.on(); };
      //   setTimeout(function () { soundsRadioNext.play(); }, 400);
      //   soundsRadioNext.on('complete', function () {
      //      radio.next();
      //      radioState = 1;
      //      console.log('Radio play next station.');
      //      if (radioState === 1) { radio.on(); };
      //   });
      // } else if (intent === "RadioPrev" && confidence > .5) {
      //   if (radioState === 1) { radio.on(); };
      //   setTimeout(function () { soundsRadioPrev.play(); }, 400);
      //   soundsRadioPrev.on('complete', function () {
      //      radio.prev();
      //      radioState = 1
      //      console.log('Radio play previous station.');
      //      if (radioState === 1) { radio.on(); };
      //   });
      // } else if (intent === "RadioVolumeUp" && confidence > .5) {
      //   if (radioState === 1) { radio.on(); };
      //   setTimeout(function () { soundsRadioVolumeUp.play(); }, 400);
      //   soundsRadioVolumeUp.on('complete', function () {
      //      radio.volumeUp();
      //      console.log('Turning volume up.');
      //      if (radioState === 1) { radio.on(); };
      //   });
      // } else if (intent === "RadioVolumeDown" && confidence > .5) {
      //   if (radioState === 1) { radio.on(); };
      //   setTimeout(function () { soundsRadioVolumeDown.play(); }, 400);
      //   soundsRadioVolumeDown.on('complete', function () {
      //      radio.volumeDown();
      //      console.log('Turning volume down.');
      //      if (radioState === 1) { radio.on(); };
      //   });
      // } else if (intent === "Shutdown" && confidence > .5) {
      //   if (radioState === 1) { radio.on(); };
      //   setTimeout(function () { soundsShutdown.play(); }, 400);
      //   soundsShutdown.on('complete', function () {
      //     console.log('Shutting down...'); 
      //     shutdownNow();
      //   });
      // } else if (intent === "WeatherCurrent" && confidence > .5) {
      //   if (radioState === 1) { radio.off(); };
      //   getWeather('Denver', function (wx) {
      //     tts(wx);
      //   });
      //   setTimeout(function () {
      //     if (radioState === 1) { radio.on(); };
      //   }, 3000);
      // } else if (intent === "Hello" && confidence > .5) {
      //   if (radioState === 1) { radio.off(); };
      //   setTimeout(function () { soundsHello.play(); }, 400);
      //   soundsHello.on('complete', function () {
      //     if (radioState === 1) { radio.on(); };
      //     console.log('Hello');
      //   });
      // } else {
      //   console.log('I\'m not sure what you said. Did you mean: ' + intent + ' (' + confidence + ')');
      //   new Sound('sounds/custom/i-dont-understand.wav').play();
      // }
    } else {
      audio.play('sounds/custom/i-dont-understand.wav');
      console.log('I\'m not sure I understand.');
      reset();
    }
  });
}

var recordAudio = function () {
  if (radioState === 1) { radio.off(); };
  audio.play('sounds/custom/what-can-i-do.wav');
  setTimeout(function () {
    console.log('Start recording...');
    leds.on(1,1,0);
    audio.play('sounds/boopG.wav');
    audio.rec('0:03');
  }, 1300);
  setTimeout(function () {
    console.log('Recording complete.');
    leds.off();
    audio.play('sounds/boopC.wav');
    setTimeout(function () {
      if (radioState === 1) { radio.on(); };
      getIntent();
    }, 300);
  }, 4300);
}

var tts = function (text) {
  exec('pico2wave -w temp.wav \'' + text + '\'', function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    new Sound('temp.wav').play();
  });
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
  leds.off();
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
    // console.log('LOCKED');
    leds.on(0,1,0);
    locked = 2;
    recordAudio();
  }
}

var states = function () {
  setTimeout(statesInterval, 1000);
}

// INIT
console.log("Starting up...");
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

// DEV // listen for the "keypress" event
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

// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
