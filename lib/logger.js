var fs = require('fs');

var file = 'log.txt';

var command = function (command) {
  var now = new Date();
  var log = now + ' : ' + command + '\n';
  fs.appendFile(file, log, function (err) {
    if (err) return console.log(err);
  });
}

module.exports.command = command;