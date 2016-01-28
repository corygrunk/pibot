var dotenv = require('dotenv');
  dotenv.config({silent: true});
  dotenv.load();
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var wit = require('./lib/wit');
var rec = require('./lib/record');
var tts = require('./lib/tts');
var leds = require('./lib/leds');
var radio = require('./lib/radio');
var intents = require('./intents/intents');
var passive = require('./passive/passive');
var fs = require('fs');
var ip = require('./lib/ip');
var http = require('http');
var request = require('request');

// FOR TESTING INTENTS
// wit.textIntent('Play NPR', function (data) {
//   intents.query(data.intent, data.confidence, data.entities);
// });

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

var senses = {}; // SENSOR OBJECT - senses.distance & senses.motion
if (process.env.NODE_ENV === 'development') {
  senses = { motion: 0, distance: 141 }
}

var searchDuration = 5;
var minLockDist = 5;
var maxLockDist = 50;

var presence = 0;
var presenceCount = 0;
var presenceCountLast = 0;
var presenceTresh = 120; // Seconds

var activateState = 0;
var waiting = 0;
var searching = 0;
var locked = 0;
var recording = 0;
var serialState = 0;

var globalIntentSounds = {}
globalIntentSounds.voiceCommand = [
  'sounds/custom/what-can-i-do.wav'
];

var checkSerial = function () {
  if (senses.distance && serialState === 0) {
    serialState = 1;
    setTimeout(function () {
      console.log('Activated.');
      activateState = 1;
      leds.blink(0,1,0);
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
  if (activateState === 1) {
    if (senses.motion === 1 && presence === 1) {
      console.log('New presence detected.');
      // passive.welcome();
      console.log('Welcome back.');
      presence = 2;
    }
    if (senses.motion === 1 && presence < 1 || senses.motion === 1 && presence > 1) {
      presenceCount = presenceCount + 1;
      presence = presence + 1;
    };
    // console.log('Presence: ' + presence + ' / Presence Count: ' + presenceCount + ' / Presence Count Last: ' + presenceCountLast + ' / Motion: ' + senses.motion);
  }
}

// DETECT IF THERE'S ANY MOTION DURING A SET INTERVAL
var presenceDetect = function (intervalSeconds) {
  setInterval(function () {
    // console.log('Calling presenceDetect()');
    if (presenceCount !== presenceCountLast) {
      // console.log('I still sense a presence.');
      presenceCountLast = presenceCount;
    } else {
      console.log('Zzzzzzzzzzzzzzzzzz...');
      presence = 0;
      presenceCount = 0;
      presenceCountLast = 0;
    }
  }, intervalSeconds * 1000)
}
presenceDetect(presenceTresh);

var states = function () {
  setTimeout(statesInterval, 1000);
}

var statesInterval = function () {
  var logState = 'waiting: ' + waiting + ' / searching: ' + searching + ' / locked: ' + locked + ' / recording: ' + recording + ' / motion: ' + senses.motion + ' / distance: ' + senses.distance;
  // console.log(logState);
  if (senses.distance >= minLockDist && senses.distance <= maxLockDist && locked !== 2) {
    searching = searching + 1;
  }
  if (searching > 0 && searching < searchDuration && locked === 0) {
    console.log('Locking... ' + searching);
    leds.on(0,0,1);
  }
  if (searching > 0 && searching < searchDuration && senses.distance > maxLockDist) {
    leds.off();
    reset();
  }
  if (searching > 0 && searching < searchDuration && senses.distance < minLockDist) {
    leds.off();
    reset();
  }
  if (searching === searchDuration && locked === 0) {
    locked = 1;
  }
  if (locked === 2) { // LOCK THE SEARCHING MECHANISM UNTIL RESET
    searching = 0;
  }
  if (locked === 1) {
    leds.on(0,1,0);
    locked = 2;
    setTimeout(function () {
      leds.off();
      rec.file(4, function (file) {
        wit.audioIntent('sample.wav', function (data) {
          intents.query(data.intent, data.confidence, data.entities);
        });
      });
    }, 700);
    setTimeout(function () {
      reset();
    }, 10000);
  }
  presenceCounter();
}

// INIT
console.log("/////// INIT");
leds.off();
radio.repeat();
radio.volume(85);
radio.off();
ip.print();

// WEB SERVER TO RECEIVE NOTIFICATIONS - TO DO
// http://stackoverflow.com/questions/12006417/nodejs-server-that-accepts-post-requests
//
var config = {}
config.server = {
  "port": 5000,
  "host": "127.0.0.1",
}

ip.get(function (ip) {
  config.server.host = ip;
});

console.log(config.server.host);
var server = http.createServer( function(req, res) {
  if (req.method == 'GET') {
    res.end('piBot: Hello world.');
  }
  if (req.method == 'POST') {
    console.log("POST");
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      console.log("Body: " + body);
      tts.say('I have recieved a notification. ' + body);
    });
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('POST received.');
  }
});
port = config.server.port;
host = config.server.host;
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);


// TEST NOTIFICATION 
var testNotify = function (notifyBody) {
  request({
      url: 'http://' + host + ':' + port,
      method: 'POST',
      headers: {
          'Content-Type': 'MyContentType',
          'Custom-Header': 'Custom Value'
      },
      body: notifyBody
  }, function(error, response, body){
      if(error) {
          console.log(error);
      } else {
          console.log(response.statusCode, body);
      }
  });
  }


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
    if (key && key.name === 'p') {
      testNotify('This is a test notification');
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
