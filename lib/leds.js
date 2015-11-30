var Gpio = require('onoff').Gpio;

// GPIO PINS
var ledRed = new Gpio(15, 'out');
var ledGreen = new Gpio(24, 'out');
var ledBlue = new Gpio(25, 'out');

module.exports = function() {
	ledRed.writeSync(0); 
	ledGreen.writeSync(0);
	ledBlue.writeSync(1);
}