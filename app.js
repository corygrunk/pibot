var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor 
var Sound = require('node-aplay');
var sys = require('sys');
var Gpio = require('onoff').Gpio;
var exec = require('child_process').exec;
var child;
var sp = new SerialPort("/dev/ttyACM0", {
  baudrate: 19200,
  parser: serialport.parsers.readline("\n")
});

// GPIO PINS
var ledRed = new Gpio(15, 'out');
var ledGreen = new Gpio(24, 'out');
var ledBlue = new Gpio(25, 'out');

var senses = {};

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

var exit = function () {
  ledBlue.writeSync(0);
  ledRed.writeSync(0);
  ledGreen.writeSync(0);
  process.exit();
}

var getAudio = function(soundArray) {
   return soundArray[Math.floor(Math.random() * soundArray.length)];
}

var ledOn(color) = function () {
  if (color === "red") {
    ledRed.writeSync(1); ledGreen.writeSync(0); ledBlue.writeSync(0);
  } else if (color === "green") {
    ledRed.writeSync(0); ledGreen.writeSync(1); ledBlue.writeSync(0);
  } else if (color === "blue") {
    ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(1);
  } else {
    ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(1);
  }
}

var lightsOut = function () {
  ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0); 
}

var blink = function(color, howLong){
  var intervalId = setInterval(function(){
    if (color === "red") {
      if (ledRed.readSync() ^ 1) {
        ledRed.writeSync(1); ledGreen.writeSync(0); ledBlue.writeSync(0);
      } else {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
      }
    } else if (color === "green") {
      if (ledGreen.readSync() ^ 1) {
        ledRed.writeSync(0); ledGreen.writeSync(1); ledBlue.writeSync(0);
      } else {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
      }
    } else if (color === "blue") {
      if (ledBlue.readSync() ^ 1) {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(1);
      } else {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
      }
    } else {
      if (ledBlue.readSync() ^ 1) {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(1);
      } else {
        ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
      }
    }
  }, 250);
  setTimeout(function(){
    clearInterval(intervalId);
    ledGreen.writeSync(0);
    ledBlue.writeSync(0);
    ledRed.writeSync(0);
  }, howLong);
}


// STATES
var states = {
  "sleep" : 0,
  "searching" : 0,
  "lost" : 0,
  "found" : 0,
  "wakeup" : 0,
  "hibernate" : 0,
  "radioControl": 0
}
if (states.sleep) {
  // If I see something, say something
}





// ACTIONS 
var actionCounter = 0;

var detectMotion = function () {
  actionCounter++;
  if (actionCounter === 1) {
    console.log("Who's there?");
    ledOn("blue");
  } else if (actionCounter > 1 && senses.motion === 1) {
    console.log("Still searching");
  } else {
    actionCounter = 0;
  }
}

var radioState = 0;
var actionRadioReset = function() { actionCounter = 0 };
var actionRadio = function (holdCount) {
  actionCounter++;
  console.log('Counter: ' + actionCounter);
  if (actionCounter === holdCount) {
    if (radioState === 0) {
      child = exec("mpc play 2", function (error, stdout, stderr) {
        blink("green", 1000);
        console.log( 'Radio toggled.' );
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });  
      radioState = 1;
    } else {
      child = exec("mpc stop", function (error, stdout, stderr) {
        console.log( 'Radio toggled.' );
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });    
      radioState = 0;
    }
    setTimeout(function() {
      actionCounter = 0;
      console.log('Counter reset');
    }, 3000);
  } else {
    return;
  }
}

// INIT
console.log("Starting up...");
ledBlue.writeSync(0);
ledRed.writeSync(0); 
ledGreen.writeSync(0); 
child = exec("mpc stop", function (error, stdout, stderr) {
  console.log( 'Radio stopped.' );
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});
child = exec("sudo nohup voicecommand -c &", function (error, stdout, stderr) {
  console.log( 'Voice Control started.' );
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});

// TURN ON ARDUINO SERIAL COMMUNITCATION
sp.on('open', function () {
  console.log('Serial connection started.');
  new Sound(getAudio(soundWakey)).play(); // Play activate sound
  sp.on('data', function(data) {
    if (data.charAt(0) === "{" && data.charAt(data.length - 1) === "}") {
      senses = JSON.parse(data);
    }
    //console.log(senses);
    if (senses.motion === 1) {
      detectMotion();
    }
    if (senses.distance < 10) {
      actionRadioReset();
    } else if (senses.distance > 9 && senses.distance < 100) {
      actionRadio(5);
    } else if (senses.distance > 99 && senses.distance < 200) {
      actionRadioReset();
    } else {
      actionRadioReset();
    }
  });
});



process.on('SIGINT', exit);
