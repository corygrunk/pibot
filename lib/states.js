module.exports = function () {
	var actions = function () {
	  if (senses.distance < 20) {
	    leds.on(0,0,1);
	  } else {
	    leds.off();
	  };
	}
}