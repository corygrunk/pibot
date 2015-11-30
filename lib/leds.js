var Gpio = require('onoff').Gpio;

// GPIO PINS
var ledRed = new Gpio(15, 'out');
var ledGreen = new Gpio(24, 'out');
var ledBlue = new Gpio(25, 'out');

module.exports = function() {
	this.on = function (r, g, b) {
		if (r === null) { r = 0 };
		if (g === null) { g = 0 };
		if (b === null) { b = 0 };
		ledRed.writeSync(r); ledGreen.writeSync(g); ledBlue.writeSync(b);
	}
}