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