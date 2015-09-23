var Gpio = require('onoff').Gpio;

// GPIO PINS
var ledRed = new Gpio(15, 'out');
var ledGreen = new Gpio(24, 'out');
var ledBlue = new Gpio(25, 'out');

function leds() {

	this.on = function (red, green, blue) {
		ledRed.writeSync(red); ledGreen.writeSync(green); ledBlue.writeSync(blue);
	}

	this.off = function () {
	  ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0); 
	}

	this.blink = function (color, howLong, offState) {

	}
}

module.exports = leds;
