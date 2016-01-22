var sys = require('sys');
var exec = require('child_process').exec;
var child;
var radioState = 0;

var on = function () {
  exec('mpc play', function(error, stdout, stderr) {
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
    off();
    radioState = 0;
  } else {
    on();
    radioState = 1;
  }
}

var repeat = function () {
  exec('mpc repeat', function(error, stdout, stderr) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
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

var volumeUp = function () {
  exec('mpc volume +5', function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

var volumeDown = function () {
  exec('mpc volume -5', function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

var next = function () {
  exec('mpc play -q  && mpc next', function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

var prev = function () {
  exec('mpc play -q  && mpc prev', function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

var getVol = function (callback) {
  exec('mpc volume', function(error, stdout, stderr) {
    if (error !== null) { console.log('exec error: ' + error); }
    var pattern = /\d+/g;
    var vol = stdout.match(pattern);
    callback(vol[0]);
  });
}

module.exports.on = on;
module.exports.off = off;
module.exports.toggle = toggle;
module.exports.repeat = repeat;
module.exports.station = station;
module.exports.volume = volume;
module.exports.volumeUp = volumeUp;
module.exports.volumeDown = volumeDown;
module.exports.getVol = getVol;
module.exports.next = next;
module.exports.prev = prev;
