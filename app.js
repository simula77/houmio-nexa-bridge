var telldus = require('telldus');
var fs = require('fs');
var winston = require('winston');
var conf = JSON.parse(fs.readFileSync('./config.json'));
var WebSocket = require('ws');
var ws = return new WebSocket(conf.serverAddress);
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'logs/nexa-bridge.log', level: conf.logLevel })
    ]
  });

ws.on('open', function() {
  logger.info('Connected to ' + conf.serverAddress);
  publish = JSON.stringify({ command: "publish", data: { sitekey: conf.siteKey, vendor: "knx" } });
  ws.send(publish);
  logger.debug('sent publish', publish);
});

ws.on('message', function(msg) {
  logger.debug('received message %s', msg);
  message = JSON.parse(msg);
  if (message.command === 'set') {
    handleSetCommand(message);
  }
});

function handleSetCommand(message) {
  var deviceId = parseInt(message.data.groupaddress);
  if (message.data.value == 1) {
    telldus.turnOnSync(deviceId);
  } else {
    telldus.turnOffSync(deviceId);
  }
};

var deviceEventListener = telldus.addDeviceEventListener(function(deviceId, status) {
  logger.debug('received event for device ' + deviceId + ' status: ' + status.name);
  var message = JSON.stringify({ command: "knxbusdata", data: deviceId + " " + (status === 'ON' ? 0 : 1) });
  ws.send(message);
  logger.debug('sent knxbusdata', message);
});

ws.on('ping', function(ping) {
  logger.debug('ping received');
  ws.pong();
});

ws.on('error', function(error) {
  logger.info('Error received: %s -> exiting', error);
  process.exit(1);
});

ws.on('close', function() {
  logger.info('Connection closed -> exiting');
  process.exit(1);
});
