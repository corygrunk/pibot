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
var radioState = 0;

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

var toggleRadio = function () {
  if (radioState === 0) {
    child = exec("mpc stop", function (error, stdout, stderr) {
      console.log( 'Radio toggled.' );
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });  
    radioState = 1;
  } else {
    child = exec("mpc play 2", function (error, stdout, stderr) {
      console.log( 'Radio toggled.' );
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });        
    radioState = 0;
  }
}

// ACTIONS 

var actionCounter = 0;

var actionRadio = function (timeout) {
  if (actionCounter === 0) {
    // DO ACTION
    toggleRadio();
    actionCounter = 1;
    setTimeout(function(){
      // WAIT FOR TIMEOUT
      actionCounter = 0;
    }, timeout);
  } else {
    return;
  }
}



// INIT
console.log("Starting up...");
ledBlue.writeSync(1);
ledRed.writeSync(0); 
ledGreen.writeSync(0); 
child = exec("mpc stop", function (error, stdout, stderr) {
  console.log( 'Radio stopped.' );
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});  

// TURN ON ARDUINO SERIAL COMMUNITCATION
sp.on('open', function () {
  console.log('Serial connection started.');
  new Sound(getAudio(soundWakey)).play(); // Play activate sound
  sp.on('data', function(data) {
    if (data.charAt(0) === "{") {
      senses = JSON.parse(data);
    }
    // console.log(senses);
    
    if (senses.distance < 50) {
      actionRadio(5000);
    }
    

    if (senses.distance < 10) {
      ledBlue.writeSync(0);
      ledRed.writeSync(0);
      ledGreen.writeSync(1);
    } else if (senses.distance > 10 && senses.distance < 50) {
      ledBlue.writeSync(0);
      ledRed.writeSync(1);
      ledGreen.writeSync(0);
    } else {
      ledBlue.writeSync(1);
      ledRed.writeSync(0);
      ledGreen.writeSync(0);
    }
  });
});



process.on('SIGINT', exit);
