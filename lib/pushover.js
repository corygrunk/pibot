var tts = require('../lib/tts');
var leds = require('../lib/leds');
var request = require('request');
var WebSocket = require('ws');
var ws = new WebSocket('wss://client.pushover.net/push');
var mySecret = process.env.PUSHOVER_SECRET || null;
var myDeviceId = process.env.PUSHOVER_DEVICE_ID || null;
var myDeviceName = process.env.PUSHOVER_DEVICE_NAME || null;

var client = function () {

  var getSecret = function (callback) {
    request({
      url: 'https://api.pushover.net/1/users/login.json',
      method: 'POST',
      qs: {
        'email': process.env.PUSHOVER_USER,
        'password': process.env.PUSHOVER_PASSWORD
      }
    }, function(error, response, body){
      if (!error && response.statusCode === 200) {
        var obj = JSON.parse(body);
        callback(obj);
      } else {
        console.log(response.statusCode, body);
      }
    });
  }

  var registerDevice = function (secret, name, callback) {
    request({
      url: 'https://api.pushover.net/1/devices.json',
      method: 'POST',
      qs: {
        'secret': secret,
        'name': name,
        'os': 'O'
      }
    }, function(error, response, body){
      if (!error && response.statusCode === 200) {
        var obj = JSON.parse(body);
        callback(obj);
      } else {
        console.log(response.statusCode, body);
      }
    });
  }

  var downloadMsgs = function (secret, device_name, device_id, callback) {
    request({
      url: 'https://api.pushover.net/1/messages.json',
      method: 'GET',
      qs: {
        'secret': secret,
        'device_name': device_name,
        'device_id': device_id
      }
    }, function(error, response, body){
      if (!error && response.statusCode === 200) {
        var obj = JSON.parse(body);
        callback(obj);
      } else {
        console.log(response.statusCode, body);
      }
    });
  }

  var deleteMsgs = function(secret, device_id, highest_msg_number, callback) {
    request({
      url: 'https://api.pushover.net/1/devices/' + device_id + '/update_highest_message.json',
      method: 'POST',
      qs: {
        'secret': secret,
        'message': highest_msg_number
      }
    }, function(error, response, body){
      if (!error && response.statusCode === 200) {
        var obj = JSON.parse(body);
        callback(obj);
      } else {
        console.log(response.statusCode, body);
      }
    });
  }

  var downloadDelete = function (secret, device_name, device_id) {
    downloadMsgs(secret, device_name, device_id, function (data) {
      // GRAB HIGHEST MESSAGE ID
      var idHolder;
      for (var i = 0; i < data.messages.length; i++) {
        idHolder = data.messages[i].id;
      }
      deleteMsgs(secret, device_id, idHolder, function (data) {
        // console.log(data);
        console.log('Pushover: Deleted messages.');
      });
    });
  }

  var notify = function (callback) {
    downloadMsgs(mySecret, myDeviceName, myDeviceId, function (data) {
      callback(data.messages);
    });
  }

  var issCountdown = function () {
    setTimeout(function () {
      tts.play('Excuse me, the International Space Station is overhead right now.');
      console.log('Excuse me, the International Space Station is overhead right now.');
    }, 1740000); // 29 minutes
  }


  // WEB SOCKET
  ws.on('open', function open() {
    console.log('Pushover: Socket opened.');
    ws.send('login:' + myDeviceId + ':' + mySecret + '\n');
    downloadDelete(mySecret, myDeviceName, myDeviceId);
  });

  ws.on('close', function close() {
    console.log('Pushover: Socket disconnected.');
  });

  ws.on('message', function incoming(message) {
    JSON.stringify(message);
    if (message == '#') {
      // console.log('Keep-alive packet, no response needed.');
    }
    if (message == '!') {
      console.log('Pushover: A new message has arrived; you should perform a sync.');
      notify(function (data) {
        console.log(data);
        if (data[0].app === 'IFTTT') {
          data[0].app = 'If This Then That';
        }
        if (data[0].app === 'NzbDrone') {
          data[0].app = 'Plex';
          var pattern = /.+?(?= - )/;
          var showName = data[0].message.match(pattern);
          var msg = 'A new episode of ' + showName + ' has downloaded.';
          data[0].message = msg;
        }
        leds.blink(0,0,1);
        tts.say('Excuse me. You have a new notification from ' + data[0].app + '. ' + data[0].message);
        console.log('New notification from ' + data[0].app + '. ' + data[0].message);
        downloadDelete(mySecret, myDeviceName, myDeviceId);
      });
    }
    if (message == 'R') {
      console.log('Pushover: Reload request; you should drop your connection and re-connect.');
    }
    if (message == 'E') {
      console.log('Pushover: Error - a permanent problem occured and you should not automatically re-connect. Prompt the user to login again or re-enable the device.');
    }
  });

}

module.exports.client = client;
