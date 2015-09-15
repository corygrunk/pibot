var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor 
var Sound = require('node-aplay');
var pico = require('picotts');
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

var ledOn = function (color) {
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
var sleep = true,
    search = false,
    lost = false,
    found = false,
    wake = false,
    hibernate = false;

var changeState = function (state) {
  if (state === "sleep") { sleep = true; search = false; lost = false; found = false; wake = false; hibernate = false; }
  else if (state === "search") { sleep = false; search = false; lost = false; found = false; wake = false; hibernate = false; }
  else if (state === "lost") { sleep = false; search = false; lost = true; found = false; wake = false; hibernate = false; }
  else if (state === "found") { sleep = false; search = false; lost = false; found = true; wake = false; hibernate = false; }
  else if (state === "wake") { sleep = false; search = false; lost = false; found = false; wake = true; hibernate = false; }
  else if (state === "hibernate") { sleep = false; search = false; lost = false; found = false; wake = false; hibernate = true; }
}


// ACTIONS 
var actionCounter = 0;
var actionCounterReset = function() { actionCounter = 0 };

var actionExample = function (holdCount) {  // holdCount = How long to do this action?
  actionCounter++;
  console.log('Counter: ' + actionCounter);
  if (actionCounter === 1) {                // Inital action upon entering state
    console.log("Entered example state");
  } else if (actionCounter === holdCount) { // Action once holdCount is met
    setTimeout(function() {                 // Wait 3 seconds and reset state
      actionCounter = 0;
      console.log('Counter reset');
    }, 3000);
  } else {
    return;
  }
}

var voice = function(sayWhat) {
  pico.say(sayWhat, 'en-US', function(err) {
    if (!err) { console.log(sayWhat) }
  });
}

var radioState = 0;
var actionRadio = function (holdCount) {
  actionCounter++;
  console.log('Counter: ' + actionCounter);
  if (actionCounter === holdCount) {
    if (radioState === 0) {
      child = exec("service shairport stop", function (error, stdout, stderr) {
        console.log( 'Stopping Shairport.' );
        if (error !== null) {
        console.log('exec error: ' + error);
       }
      });
      child = exec("mpc play 2", function (error, stdout, stderr) {
        voice("Radio activated.");
        blink("green", 1000);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });  
      radioState = 1;
    } else {
      child = exec("mpc stop", function (error, stdout, stderr) {
        voice("Radio stopped.");        
        blink("green", 1000);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
      child = exec("service shairport start", function (error, stdout, stderr) {
        console.log( 'Starting Shairport.' );
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


// MODES
var presenseTimer;
var presenseMode = function () {
  console.log('Presense mode activated.');
  console.log('Motion: ' + senses.motion);
  
  presenseTimer = setInterval(function() {
    console.log('Timer running: ' + senses.motion);
  }, 1000);
  setTimeout(function () {
    console.log('This: ' + senses.motion);
    if (senses.motion === 0) {
      console.log('Timeout: ' + senses.motion);
      clearInterval(presenseTimer);
    } else {
      console.log('Restart timer: ' + senses.motion);
      clearInterval(presenseTimer);
      
    }
  }, 10000);
}

//var presenseCounter = 0;
//setInterval(function () {
//  presenseCounter++;
//  if (senses.motion === 1) {
//    presenseMode();
//  }
//}, 1000);



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
child = exec("sudo nohup ../airplay-audio-project/shairport/shairport -a piBot &", function (error, stdout, stderr) {
  console.log( 'Shairport started.' );
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});

// TURN ON ARDUINO SERIAL COMMUNITCATION
sp.on('open', function () {
  console.log('Serial connection started.');
  voice("Hello, my name is Audi.");
  sp.on('data', function(data) {
    if (data.charAt(0) === "{" && data.charAt(data.length - 1) === "}") {
      senses = JSON.parse(data);
    }
    //console.log(senses);
    
    if (senses.distance < 10) {
      actionCounterReset();
      ledOn("red");
    } else if (senses.distance > 9 && senses.distance < 100) {
      ledOn("green");
      actionRadio(5);
    } else if (senses.distance > 99 && senses.distance < 200) {
      actionCounterReset();
      ledOn("blue");
    } else {
      actionCounterReset();
    }
  });
});


var exit = function () {
  ledBlue.writeSync(0);
  ledRed.writeSync(0);
  ledGreen.writeSync(0);
  process.exit();
}

process.on('SIGINT', exit);
