var WebSocket = require('ws');
var telldus = require('telldus');
var fs = require('fs');
var winston = require('winston');
var conf = JSON.parse(fs.readFileSync('./config.json'));
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'logs/nexa-bridge.log', level: conf.logLevel })
    ]
  });

var connectWebSocket = function() {
  return new WebSocket(conf.serverAddress);
};
var ws = connectWebSocket();

ws.on('open', function() {
  logger.info('Connected to ' + conf.serverAddress);
  publish = JSON.stringify({ command: "publish", data: { sitekey: conf.siteKey, vendor: "knx" } });
  ws.send(publish);
  logger.debug('sent publish %s', publish);
});

ws.on('message', function(msg) {
  message = JSON.parse(msg);
  logger.debug('received message %s', message);
  var deviceId = parseInt(message.data.groupaddress);
  if (message.data.value == 1) {
    telldus.turnOnSync(deviceId);
  } else {
    telldus.turnOffSync(deviceId);
  }
});

ws.on('ping', function(ping) {
  logger.debug('ping received');
  ws.pong();
});

ws.on('error', function(error) {
  logger.info('Error received: %s -> exiting', error);
  process.kill();
});

ws.on('close', function() {
  logger.info('Connection closed -> exiting');
  process.kill();
});