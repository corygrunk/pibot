if (process.env.NODE_ENV !== 'development') { 
  var Gpio = require('onoff').Gpio;

  // GPIO PINS
  var ledRed = new Gpio(15, 'out');
  var ledGreen = new Gpio(24, 'out');
  var ledBlue = new Gpio(25, 'out');

  var on = function (r, g, b) {
    if (r === null) { r = 0 };
    if (g === null) { g = 0 };
    if (b === null) { b = 0 };
    ledRed.writeSync(r); ledGreen.writeSync(g); ledBlue.writeSync(b);
  }

  var off = function () {
    ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
  }

  var blink = function (r, g, b) {
    if (r === null) { r = 0 };
    if (g === null) { g = 0 };
    if (b === null) { b = 0 };
    setTimeout(function () {
      ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
    }, 100);
    setTimeout(function () { 
      ledRed.writeSync(r); ledGreen.writeSync(g); ledBlue.writeSync(b);
    }, 200);
    setTimeout(function () {
      ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
    }, 300);
    setTimeout(function () { 
      ledRed.writeSync(r); ledGreen.writeSync(g); ledBlue.writeSync(b);
    }, 400);
    setTimeout(function () {
      ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
    }, 500);
  }
} else {
  var on = function (r, g, b) {
    console.log('LED on: ' + r + ',' + g + ',' + b);
  }
  var off = function () {
    console.log('LED off');
  }
  var blink = function (r, g, b) {
    console.log('LED blink: ' + r + ',' + g + ',' + b);
    setTimeout(function () {
      console.log('LED blink off');
    }, 100);
    setTimeout(function () {
      console.log('LED blink on: ' + r + ',' + g + ',' + b);
    }, 200);
    setTimeout(function () {
      console.log('LED blink off');
    }, 300);
    setTimeout(function () {
      console.log('LED blink on: ' + r + ',' + g + ',' + b);
    }, 400);
    setTimeout(function () {
      console.log('LED blink off');
    }, 500);
  }
}

module.exports.on = on;
module.exports.off = off;
module.exports.blink = blink;

