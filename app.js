var dotenv = require('dotenv');
  dotenv.config({silent: true});
  dotenv.load();
var exec = require('child_process').exec;
var child;
var wit = require('./lib/wit');
var sox = require('./lib/sox-play');
var rec = require('./lib/record');
var tts = require('./lib/tts');
var leds = require('./lib/leds');
var radio = require('./lib/radio');
var pushover = require('./lib/pushover');
var intents = require('./intents/intents');
var passive = require('./passive/passive');
var fs = require('fs');
var ip = require('./lib/ip');
var http = require('http');
var request = require('request');
var log = require('./lib/logger');

var searchDuration = 6;
var minLockDist = 5;
var maxLockDist = 50;

var interactionState = 0;
var presence = 0;
var presenceCount = 0;
var presenceCountLast = 0;
var presenceTresh = 240; // Seconds

var activateState = 0;
var waiting = 0;
var searching = 0;
var locked = 0;
var recording = 0;
var serialState = 0;

pushover.client();

// FOR TESTING INTENTS
// wit.textIntent('Say something really really interesting.', function (data) {
//   console.log(data);
//  intents.query(data.intent, data.confidence, data.entities, data.text);
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
  senses = { motion: 0, distance: 141 };
}

var checkSerial = function () {
  if (senses.distance && serialState === 0) {
    serialState = 1;
    setTimeout(function () {
      tts.say('I am now online.');
      console.log('I am now online.');
      activateState = 1;
      leds.blink(0,1,0);
    }, 5000);
  }
};

var reset = function () {
  waiting = 0;
  searching = 0;
  locked = 0;
  shutdown = 0;
  // console.log('Reset');
};

// RULES FOR PRESENCE:
// MOTION DETECTED WITHIN THE PAST 60 SECONDS
// IF NO MOTION FOR 240 SEC PRESENCE = 0;
var presenceCounter = function () {
  if (activateState === 1) {
    if (senses.motion === 1 && presence === 1) {
      // console.log('New presence detected.');
      passive.welcome();
      presence = 2;
    }
    if (senses.motion === 1 && presence < 1 || senses.motion === 1 && presence > 1) {
      presenceCount = presenceCount + 1;
      presence = presence + 1;
    }
    // console.log('Presence: ' + presence + ' / Presence Count: ' + presenceCount + ' / Presence Count Last: ' + presenceCountLast + ' / Motion: ' + senses.motion);
  }
};

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
  }, intervalSeconds * 1000);
};
presenceDetect(presenceTresh);


var states = function () {
  setTimeout(statesInterval, 1000);
};

var statesInterval = function () {
  if (tts.state === 1 || wit.state === 1 || rec.state === 1 && sox.state === 1 && passive.state === 1) {
    interactionState = 1;
  } else {
    interactionState = 0;
  }
  //console.log('interactionState: ' + interactionState + ' / tts.state: ' + tts.state + ' / wit.state: ' + wit.state + ' / rec.state: ' + rec.state + ' / sox.state: ' + sox.state);
  // var logState = 'waiting: ' + waiting + ' / searching: ' + searching + ' / locked: ' + locked + ' / recording: ' + recording + ' / motion: ' + senses.motion + ' / distance: ' + senses.distance;
  // console.log(logState);
  if (activateState === 1 && senses.distance >= minLockDist && senses.distance <= maxLockDist && locked !== 2 && interactionState === 0) {
    searching = searching + 1;
  }
  if (searching > 0 && searching < searchDuration && locked === 0 && interactionState === 0) {
    // console.log('Locking... ' + searching);
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
          intents.query(data.intent, data.confidence, data.entities, data.text);
        });
      });
    }, 700);
    setTimeout(function () {
      reset();
    }, 10000);
  }
  presenceCounter();
};

// INIT
console.log("/////// INIT");
tts.say('Running startup routine.');
log.system('Starting up.');
leds.off();
radio.repeat();
radio.volume(100);
radio.off();

// WEB SERVER TO RECEIVE NOTIFICATIONS - TO DO
// http://stackoverflow.com/questions/12006417/nodejs-server-that-accepts-post-requests
//
// var config = {};
// config.server = {
//   "port": 5000,
//   "host": "127.0.0.1",
// };
//
// ip.get(function (ip) {
//   config.server.host = ip;
// });

// var server = http.createServer( function(req, res) {
//   if (req.method == 'GET') {
//     res.end('Hello world.');
//   }
//   if (req.method == 'POST') {
//     var body = '';
//     req.on('data', function (data) {
//       body += data;
//     });
//     req.on('end', function () {
//       if (req.headers.notify == 'command') {
//         console.log('command: ' + body);
//         wit.textIntent(body, function (data) {
//          intents.query(data.intent, data.confidence, data.entities);
//         });
//       } else {
//         console.log('Body: ' + body);
//         log.notify(body);
//         tts.say('Excuse me, you have a new notification. ' + body);
//       }
//     });
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.end('POST received.');
//   }
// });
// port = config.server.port;
// host = config.server.host;
// server.listen(port, host);
// console.log('Notifications server: http://' + host + ':' + port);


// TEST NOTIFICATION
var testNotify = function (notifyHeader, notifyBody) {
  request({
      url: 'http://' + host + ':' + port,
      method: 'POST',
      headers: {
          'notifyType': notify
      },
      body: notifyBody
  }, function(error, response, body){
      if(error) {
          //console.log(error);
      } else {
          //console.log(response.statusCode, body);
      }
  });
};

// TURN ON ARDUINO SERIAL COMMUNITCATION
if (process.env.NODE_ENV !== 'development') {
  sp.on('open', function () {
    console.log('Serial connection started.');
    sp.on('data', function(data) {
      if (data.charAt(0) === "{" && data.charAt(data.length - 1) === "}") {
        senses = JSON.parse(data);
      }
      checkSerial();
      states();
    });
  });
} else {
  setInterval(states, 300);
}

// DEV MODE // listen for the "keypress" event
if (process.env.NODE_ENV === 'development') {
  senses.distance = 1;
  checkSerial();
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.exit();
    }
    if (key && key.name === 'd') {
      senses.distance >= minLockDist && senses.distance <= maxLockDist ? senses.distance = maxLockDist + 1 : senses.distance = maxLockDist - 1;
      console.log('Keypress (distance: ' + senses.distance + ')');
    }
    if (key && key.name === 'm') {
      senses.motion === 1 ? senses.motion = 0 : senses.motion = 1;
      console.log('Keypress (motion: ' + senses.motion + ')');
    }
    if (key && key.name === 'o') {
      testNotify('', 'Test notification.');
      console.log('Keypress Post Notification');
    }
    if (key && key.name === 'p') {
      testNotify('Command', 'What\'s the weather.');
      console.log('Keypress Post Command');
    }
    if (key && key.name === 'y') {
      wit.textIntent('say something funny.', function (data) {
       intents.query(data.intent, data.confidence, data.entities, data.text);
      });
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

// EXIT
var exit = function () {
  leds.off();
  process.exit();
};
process.on('SIGINT', exit);
