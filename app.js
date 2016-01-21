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
var wit = require('node-wit');
var fs = require('fs');
var dotenv = require('dotenv');
  dotenv.config({silent: true});
  dotenv.load();
var ACCESS_TOKEN = process.env.WIT_AI_TOKEN || null;

// SENSOR OBJECT - senses.distance & senses.motion
var senses = {};

var waiting = 0;
var searching = 0;
var locked = 0;
var shutdown = 0;
var radioState = 0;
var serialState = 0;

var getIntent = function () {
  console.log("Sending audio to Wit...");
  var stream = fs.createReadStream('sample.wav');
  wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
    if (err) console.log("Error: ", err);
    if (res && res.outcomes.length > 0) {
      console.log(res);
      var intent = res.outcomes[0].intent;
      var confidence = res.outcomes[0].confidence;
      console.log("Received response from Wit: Intent: " + intent + " / Confidence: " + confidence);      
      if (intent === "Radio" && confidence > .5) {
        radioToggle();
      } else if (intent === "OpenAir" && confidence > .5) {
        radioStation(2);
      } else if (intent === "NPR" && confidence > .5) {
        radioStation(1);
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
  if (radioState === 1) { radioVolume(50); }
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
    if (radioState === 1) { radioVolume(90); }
    setTimeout(getIntent(), 300);
  }, 4300);
}

var radioVolume = function (volume) {
  exec('mpc volume ' + volume, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

var radioStation = function (stationNum) {
  exec('mpc play ' + stationNum, function(error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
  radioState = 1;
}

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
    serialState = 1;
    setTimeout(function () {
      // new Sound('sounds/wakey/wakey1.wav').play();
      console.log('Activated');
      new Sound('sounds/custom/online.wav').play();
    }, 5000);
  }
}

var shutdownNow = function () {
  new Sound('sounds/custom/goodbye.wav').play();
  leds.off();
  setTimeout(function () {
    exec('mpc stop && pkill -f \'app.js\'', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }, 3000);
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
    recordAudio();
    //radioToggle();
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
