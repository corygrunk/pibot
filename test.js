var sys = require('sys');
var exec = require('child_process').exec;
var child;
var Sound = require('node-aplay');
var wit = require('node-wit');
var fs = require('fs');
var dotenv = require('dotenv');
  dotenv.config({silent: true});
  dotenv.load();
var ACCESS_TOKEN = process.env.WIT_AI_TOKEN || null;

// SENSOR OBJECT - senses.distance & senses.motion
var senses = {motion: 0, distance: 141};

var waiting = 0;
var searching = 0;
var locked = 0;
var shutdown = 0;
var radioState = 0;
var serialState = 0;

var getIntent = function () {
  console.log("Sending audio to Wit...");
  // setTimeout(function () { new Sound('sounds/custom/just-a-second.wav').play() }, 1000);
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

getIntent();





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
    getIntent();
  }, 4300);
}