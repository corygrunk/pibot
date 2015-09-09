var SerialPort = require('serialport').SerialPort;
var Sound = require('node-aplay');

var serialPort = new SerialPort("/dev/ttyACM0", {
  baudrate: 9600
});

var randomAudio = function (num, folder) {
  var n = Math.floor(Math.random() * (num + 1));
  var s = '/home/pi/pibot/sounds/' + folder + '/' + folder + n.toString() + '.wav'
  return s;
};

serialPort.on('open', function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
    if (data == 2) {
      console.log('Hello');
      new Sound(randomAudio(1, 'wakey')).play();
    }

    if (data == 3) {
      console.log('Searching...');
      new Sound(randomAudio(6, 'searching')).play();
    }

    if (data == 4) {
      console.log('Stop searching...');
      new Sound(randomAudio(2, 'stop')).play();
    }

    if (data == 5) {
      console.log('Found.');
      new Sound(randomAudio(4, 'found')).play();
    }

    if (data == 6) {
      console.log('Lost.');
      new Sound(randomAudio(3, 'lost')).play();
    }

    if (data == 7) {
      console.log('Gotcha.');
      new Sound(randomAudio(3, 'gotcha')).play();
    }

    if (data == 8) {
      console.log('Wakey.');
      new Sound(randomAudio(2, 'wakey')).play();
    }

    if (data == 9) {
      console.log('Sleep.');
      new Sound(randomAudio(4, 'sleep')).play();
    }


  });
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});
