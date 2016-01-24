var sys = require('sys');
var exec = require('child_process').exec;
var child;
var radioState = 0;

var on = function () {
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc play');
  } else {
    exec('mpc play', function(error, stdout, stderr) {
      if (error !== null) {
          console.log('exec error: ' + error);
      }
    });
  }
}

var off = function () {  if (process.env.NODE_ENV === 'development') {
    console.log('mpc stop');
  } else {
    exec('mpc stop', function(error, stdout, stderr) {
      if (error !== null) {
          console.log('exec error: ' + error);
      }
    });
  }
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
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc repeat');
  } else {
    exec('mpc repeat', function(error, stdout, stderr) {
      if (error !== null) {
          console.log('exec error: ' + error);
      }
    });
  }
}

var station = function (stationNum) {
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc play ' + stationNum);
  } else {
    exec('mpc play ' + stationNum, function(error, stdout, stderr) {
      if (error !== null) {
          console.log('exec error: ' + error);
      }
    });
  }
  radioState = 1;
}

var volume = function (volume) {
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc volume ' + volume);
  } else {
    exec('mpc volume ' + volume, function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }
}

var volumeUp = function () {
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc volume +5');
  } else {
    exec('mpc volume +5', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }
}

var volumeDown = function () {
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc volume -5');
  } else {
    exec('mpc volume -5', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }
}

var next = function () {
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc play -q  && mpc next');
  } else {
    exec('mpc play -q  && mpc next', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }
}

var prev = function () {
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc play -q  && mpc prev');
  } else {
    exec('mpc play -q  && mpc prev', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }
}

var getVol = function (callback) {
  if (process.env.NODE_ENV === 'development') {
    console.log('getVol is a WIP.');
  } else {
    exec('mpc volume', function(error, stdout, stderr) {
      if (error !== null) { console.log('exec error: ' + error); }
      var pattern = /\d+/g;
      var vol = stdout.match(pattern);
      callback(vol[0]);
    });
  }
}

var current = function (callback) {
  if (process.env.NODE_ENV === 'development') {
    console.log('mpc repeat');
  } else {
    exec('mpc', function(error, stdout, stderr) {
      if (error !== null) { console.log('exec error: ' + error); }
      callback(stdout);
    });
  }
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
module.exports.current = current;
