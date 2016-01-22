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
var radio = require('./lib/radio');
var Sound = require('node-aplay');
var wit = require('node-wit');
var fs = require('fs');
var dotenv = require('dotenv');
  dotenv.config({silent: true});
  dotenv.load();
var ACCESS_TOKEN = process.env.WIT_AI_TOKEN || null;

var senses = {}; // SENSOR OBJECT - senses.distance & senses.motion

var waiting = 0;
var searching = 0;
var locked = 0;
var shutdown = 0;
var recording = 0;
var serialState = 0;

var soundsRadioOpenair = new Sound('sounds/custom/radio-openair.wav');
var soundsRadioNPR = new Sound('sounds/custom/radio-npr.wav');
var soundsRadioWWOZ = new Sound('sounds/custom/radio-wwoz.wav');

var getIntent = function () {
  console.log("Sending audio to Wit...");
  var stream = fs.createReadStream('sample.wav');
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
    if (err) console.log("Error: ", err);
    if (res && res.outcomes && res.outcomes.length > 0) {
      var intent = res.outcomes[0].intent;
      var confidence = res.outcomes[0].confidence;
      //console.log("Received response from Wit: Intent: " + intent + " / Confidence: " + confidence);      
      console.log(res);
      leds.blink(0,0,1);
      reset();
      if (intent === "Radio" && confidence > .5) {
         if (res.outcomes[0].entities.on_off[0].value === 'on') { radio.on(); }
         if (res.outcomes[0].entities.on_off[0].value === 'off') { radio.off(); }
         else { radio.toggle(); }
      } else if (intent === "OpenAir" && confidence > .5) {
        soundsRadioOpenair.play();
        soundsRadioOpenair.on('complete', function () {
         radio.station(2);
        });
      } else if (intent === "NPR" && confidence > .5) {
        soundsRadioNPR.play();
        soundsRadioNPR.on('complete', function () {
           radio.station(1);
        });
      } else if (intent === "WWOZ" && confidence > .5) {
        soundsRadioWWOZ.play();
        soundsRadioWWOZ.on('complete', function () {
           radio.station(4);
        });
      } else if (intent === "Hello" && confidence > .5) {
        new Sound('sounds/custom/hello.wav').play();
      } else {
        console.log('I\'m not sure what you said. Did you mean: ' + intent + ' (' + confidence + ')');
        new Sound('sounds/custom/i-dont-understand.wav').play();
      }
    } else {
      console.log('I\'m not sure I understand.');
      new Sound('sounds/custom/i-dont-understand.wav').play();
      reset();
    }
  });
}

var recordAudio = function () {
  radio.off();
  new Sound('sounds/custom/what-can-i-do.wav').play();
  setTimeout(function () {
    console.log('Start recording...');
    leds.on(1,1,0);
    new Sound('sounds/boopG.wav').play();
    exec('arecord -D plughw:1 --duration=3 -f cd sample.wav', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }, 1300);
  setTimeout(function () {
    console.log('Recording complete.');
    leds.off();
    new Sound('sounds/boopC.wav').play();
    setTimeout(getIntent(), 300);
  }, 4300);
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
  new Sound('sounds/custom/goodbye.wav').play();
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
  //console.log(logState);
  var searchDuration = 10;
  var minLockDist = 10;
  var maxLockDist = 30;
  if (senses.distance >= minLockDist && senses.distance <= maxLockDist) {
    searching = searching + 1;
  }
  if (searching > 0 && searching < searchDuration && locked === 0) {
    // console.log('Locking... ' + searching);
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
radio.off();

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

// EXIT
var exit = function () {
  leds.off();
  process.exit();
}
process.on('SIGINT', exit);
