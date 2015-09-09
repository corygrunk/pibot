var SerialPort = require('serialport').SerialPort;
//var Sound = require('node-aplay');
var say = require('say')

var serialPort = new SerialPort("/dev/ttyACM0", {
  baudrate: 9600
});

// var randomAudio = function (num, folder) {
//   var n = Math.floor(Math.random() * (num + 1));
//   var s = '/home/pi/pibot/sounds/' + folder + '/' + folder + n.toString() + '.wav'
//   return s;
// };

serialPort.on('open', function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
    if (data == 2) {
      console.log('Hello');
      say.speak(null, 'Hello');
      // new Sound(randomAudio(1, 'wakey')).play();
    }

    if (data == 3) {
      console.log('Searching...');
      say.speak(null, 'Searching...');
      // new Sound(randomAudio(6, 'searching')).play();
    }

    if (data == 4) {
      console.log('Stop searching...');
      say.speak(null, 'Stop searching...');
      // new Sound(randomAudio(2, 'stop')).play();
    }

    if (data == 5) {
      console.log('Found.');
      say.speak(null, 'Found.');
      // new Sound(randomAudio(4, 'found')).play();
    }

    if (data == 6) {
      console.log('Lost.');
      say.speak(null, 'Lost.');
      // new Sound(randomAudio(3, 'lost')).play();
    }

    if (data == 7) {
      console.log('Gotcha.');
      say.speak(null, 'Gotcha.');
      // new Sound(randomAudio(3, 'gotcha')).play();
    }

    if (data == 8) {
      console.log('Wakey.');
      say.speak(null, 'Wakey.');
      // new Sound(randomAudio(2, 'wakey')).play();
    }

    if (data == 9) {
      console.log('Sleep.');
      say.speak(null, 'Sleep.');
      // new Sound(randomAudio(4, 'sleep')).play();
    }


  });
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});
