var Gpio = require('onoff').Gpio;

// GPIO PINS
var ledRed = new Gpio(15, 'out');
var ledGreen = new Gpio(24, 'out');
var ledBlue = new Gpio(25, 'out');

function leds() {

	this.on = function (color) {
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

	this.off = function () {
	  ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0); 
	}

	this.blink = function (color, howLong, offState) {

	}
}

module.exports = leds;
