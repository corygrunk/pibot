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
      console.log("Received response from Wit: Intent: " + intent + " / Confidence: " + confidence);      
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
    }
  });
}

var recordAudio = function () {
  radio.off();
  new Sound('sounds/custom/what-can-i-do.wav').play();
  setTimeout(function () {
    console.log('Start recording...');
    new Sound('sounds/boopG.wav').play();
    exec('arecord -D plughw:1 --duration=3 -f cd sample.wav', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }, 1300);
  setTimeout(function () {
    console.log('Recording complete.');
    new Sound('sounds/boopC.wav').play();
    setTimeout(getIntent(), 300);
  }, 4300);
}

var checkSerial = function () {
  if (senses.distance && serialState === 0) {
    serialState = 1;
    setTimeout(function () {
      console.log('Activated');
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
  //console.log('Reset');
}

var statesInterval = function () {
  var logState = ' ///  waiting: ' + waiting + ' / searching: ' + searching + ' / locked: ' + locked + ' / motion: ' + senses.motion + ' / distance: ' + senses.distance;
  // ALL IS QUIET
  if (senses.motion === 0 && waiting === 0 && locked === 0 && recording === 0) {
    //console.log('Zzzzzzzz....     ' + logState);
    leds.off();
    waiting = 0;
  }
  // MOTION DETECTED
  if (senses.motion === 1 && waiting === 0 && locked === 0) {
    //console.log('Is someone there?' + logState);
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
    //console.log('LOCKED!          ' + logState);
    leds.on(0,1,0);
    recordAudio();
    locked = locked + 1;
  }
  if (locked > 5) {
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
