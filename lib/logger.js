var fs = require('fs');

var file = 'log.txt';

var command = function (command) {
  var now = new Date();
  var log = now + ' | Command: ' + command + '\n';
  fs.appendFile(file, log, function (err) {
    if (err) return console.log(err);
  });
}

var notify = function (command) {
  var now = new Date();
  var log = now + ' | Notification: ' + command + '\n';
  fs.appendFile(file, log, function (err) {
    if (err) return console.log(err);
  });
}

var system = function (command) {
  var now = new Date();
  var log = now + ' | System: ' + command + '\n';
  fs.appendFile(file, log, function (err) {
    if (err) return console.log(err);
  });
}

module.exports.command = command;
module.exports.notify = notify;
module.exports.system = system;