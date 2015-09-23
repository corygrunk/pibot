var leds = require('./lib/led.js');

var leds = new leds();

leds.on('red', function () {
	console.log('Red LED on.');
})