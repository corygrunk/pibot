var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyACM0", {
  baudrate: 9600
});

var incomingEvent = 0;

serialPort.on('open', function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);

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
