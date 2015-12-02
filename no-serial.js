// SENSOR OBJECT - senses.distance & senses.motion
var senses = {};

// INIT
console.log("Starting up...");

// MOCK SERIAL
var serialCounter = 0;
var mockSerial = function () {
  if (serialCounter === 3) {
    senses = { motion: 1, distance: 120 };
  } else if (serialCounter < 4) {
    senses = { motion: 0, distance: 120 };
  } else if (serialCounter > 8) {
    senses = { motion: 1, distance: 120 };
    serialCounter = 0;
  } else {
    senses = { motion: 1, distance: 120 };
  }
  //console.log(senses);
  action();
  serialCounter = serialCounter + 1;
}
setInterval(mockSerial, 200);


var waiting = 0;
var searching = 0;

var action = function () {
  if (senses.motion === 1) {
    waiting = waiting + 1;
  }
  states();
}

var states = function () {
  if (waiting === 1) {
    console.log('Is someone there?');
    watiing = 2;
  }
  if (waiting > 1) {
    console.log('Is someone there...');
  }
  if (searching === 1) {
    console.log('I see you.');
    searching = 2;
  }
  if (searching > 1) {
    console.log('Still see you...');
  }
}
