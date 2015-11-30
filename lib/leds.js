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
		console.log('On: ' + r + ',' + g + ',' + b );
}

var off = function () {
		ledRed.writeSync(0); ledGreen.writeSync(0); ledBlue.writeSync(0);
		console.log('Off');
}

module.exports.on = on;
module.exports.on = off;