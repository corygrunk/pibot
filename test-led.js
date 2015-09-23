var leds = require('./lib/leds.js');

var leds = new leds();

leds.on('red', function () {
	console.log('Red LED on.');
})

leds.off(function () {
	console.log('Lights out.');
})
