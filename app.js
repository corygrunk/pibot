var SerialPort = require('serialport').SerialPort;
var Sound = require('node-aplay');
var pico = require('picotts');

var Speakable = require('./node_modules/speakable/.');
var speakable = new Speakable({key: 'AIzaSyD4E-iVZEHV1oB37gmp-0nB5YRyFskscEQ'});


speakable.on('speechStart', function() {
  console.log('onSpeechStart');
});

speakable.on('speechStop', function() {
  console.log('onSpeechStop');
});

speakable.on('speechReady', function() {
  console.log('onSpeechReady');
});

speakable.on('error', function(err) {
  console.log('onError:');
  console.log(err);
  speakable.recordVoice();
});

speakable.on('speechResult', function(recognizedWords) {
  console.log('onSpeechResult:')
  console.log(recognizedWords);
  speakable.recordVoice();
});

speakable.recordVoice();


pico.say('Hey this is cool', 'en-US', function(err) {
  if (!err)
      console.log('Correctly played')
});

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
    }

    if (data == 3) {
      console.log('Searching...');
    }

    if (data == 4) {
      console.log('Stop searching...');
    }

    if (data == 5) {
      console.log('Found.');
    }

    if (data == 6) {
      console.log('Lost.');
    }

    if (data == 7) {
      console.log('Gotcha.');
    }

    if (data == 8) {
      console.log('Wakey.');
    }

    if (data == 9) {
      console.log('Sleep.');
    }
  });
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});
