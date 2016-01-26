var dotenv = require('dotenv');
  dotenv.config({silent: true});
  dotenv.load();
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var audio = require('./lib/sox-play');
var leds = require('./lib/leds');
var radio = require('./lib/radio');
var intents = require('./intents/intents');
var passive = require('./passive/passive');
var record = require('node-record-lpcm16');
var wit = require('node-wit');
var fs = require('fs');
var ip = require('./lib/ip');
var http = require('http');


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

var presence = 0;
var presenceCount = 0;
var presenceTresh = 4;

var waiting = 0;
var searching = 0;
var locked = 0;
var recording = 0;
var serialState = 0;

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
    if (process.env.NODE_ENV === 'development') {
      record.start();
    } else {
      audio.rec('sample.wav', 3);
    }
  }, 1300);
  setTimeout(function () {
    console.log('Recording complete.');
    if (process.env.NODE_ENV === 'development') {
      record.stop().pipe(file);
    }
    leds.off();
    audio.play('sounds/boopC.wav');
    setTimeout(function () {
      if (radio.radioState === 1) { radio.on(); };
      callback('sample.wav');
    }, 300);
  }, 4300);
}

var checkSerial = function () {
  if (senses.distance && serialState === 0) {
    serialState = 1;
    setTimeout(function () {
      console.log('Activated.');
      leds.blink(0,1,0);
      audio.play('sounds/custom/online.wav');
    }, 5000);
  }
}

var reset = function () {
  waiting = 0;
  searching = 0;
  locked = 0;
  shutdown = 0;
  // console.log('Reset');
}

// RULES FOR PRESENCE:
// MOTION DETECTED WITHIN THE PAST 60 SECONDS
// IF NO MOTION FOR 60 SEC PRESENCE = 0;
var presenceCounter = function () {
  if (senses.motion === 1) {
    presence = presence + 1;
    if (presence === 1) {
      // WELCOME MESSAGE
      passive.welcome();
      console.log('I sense a presence.');
    } 
    presenceCount = presenceCount + 1;
    //console.log('Presence: ' + presence + ' / Presence Count: ' + presenceCount + ' / Motion: ' + senses.motion);
  };
}

// DETECT IF THERE'S ANY MOTION DURING A SET INTERVAL
var presenceDetect = function (intervalSeconds) {
  setInterval(function () {
    if (presenceCount > 0) {
      //console.log('I still sense a presence.');
      presence = 1;
    } else {
      //console.log('No one is here. I\'m lonely');
      presence = 0;
    }
    presenceCount = 0;
  }, intervalSeconds * 1000)
}
presenceDetect(presenceTresh);

if (presence === 1) {
  passive.welcome();
};

var states = function () {
  setTimeout(statesInterval, 1000);
}

var statesInterval = function () {
  var logState = 'waiting: ' + waiting + ' / searching: ' + searching + ' / locked: ' + locked + ' / recording: ' + recording + ' / motion: ' + senses.motion + ' / distance: ' + senses.distance;
  //console.log(logState);
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
  presenceCounter();
}

// INIT
console.log("/////// INIT");
leds.off();
radio.repeat();
radio.volume(90);
radio.off();
ip.say();

// WEB SERVER TO RECEIVE NOTIFICATIONS - TO DO
// var server = http.createServer( function(req, res) {
//   console.dir(req.param);
//   if (req.method == 'POST') {
//     console.log("POST");
//     var body = '';
//     req.on('data', function (data) {
//       body += data;
//       console.log("Partial body: " + body);
//     });
//     req.on('end', function () {
//         console.log("Body: " + body);
//     });
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.end('post received');
//   } else {
//     console.log("GET");
//     var html = '<html><body><form method="post" action="http://localhost:5000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body></html> ';
//     //var html = fs.readFileSync('index.html');
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.end(html);
//   }
// });
// port = 5000;
// host = '127.0.0.1';
// server.listen(port, host);
// console.log('Listening at http://' + host + ':' + port);

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
    if (key && key.name === 'd') {
      locked = 1;
      console.log('Keypress');
    }
    if (key && key.name === 'm') {
      senses.motion === 1 ? senses.motion = 0 : senses.motion = 1;
      console.log('Keypress');
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
