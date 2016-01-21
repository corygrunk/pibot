var sys = require('sys');
var exec = require('child_process').exec;
var child;
var radioState = 0;

var on = function () {
  exec('mpc play 1', function(error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
}

var off = function () {
  exec('mpc stop', function(error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
}

var toggle = function () {
  if (radioState === 1) {
    radioStop();
    radioState = 0;
  } else {
    radioStart();
    radioState = 1;
  }
}

var station = function (stationNum) {
  exec('mpc play ' + stationNum, function(error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
  radioState = 1;
}

var volume = function (volume) {
  exec('mpc volume ' + volume, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

module.exports.on = on;
module.exports.off = off;
module.exports.toggle = toggle;
module.exports.station = station;
module.exports.volume = volume;