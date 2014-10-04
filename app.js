var telldus = require('telldus');
var fs = require('fs');
var winston = require('winston');
var conf = JSON.parse(fs.readFileSync('./config.json'));
var WebSocket = require('ws');
var ws = new WebSocket(conf.serverAddress);
var _ = require('lodash');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'logs/nexa-bridge.log', level: conf.logLevel })
    ]
  });
var devices = telldus.getDevicesSync(function(err, devices) {
                if ( err ) {
                   console.log('Failed to read TellStick devices!', err);
                   process.exit(1);
                 } else {
                   return JSON.stringify(devices);
                 }
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
})

function isDimmer(deviceId) {
  return _.some(devices, function(device) {
    return (device.id == deviceId) && device.model.indexOf("dimmer") > 0;
  });
}

function handleSetCommand(message) {
  var deviceId = parseInt(message.data.groupaddress);
  var dimmer = isDimmer(deviceId);
  var value = dimmer ? parseInt(message.data.value, 16) : parseInt(message.data.value);
  if (dimmer && value > 0 && value < 255) {
    telldus.dimSync(deviceId, value);
  } else if (value === 0) {
    telldus.turnOffSync(deviceId);
  } else {
    telldus.turnOnSync(deviceId);
  }
}

var deviceEventListener = telldus.addDeviceEventListener(function(deviceId, status) {
  logger.debug('received event for device ' + deviceId + ' status: ' + status.name);
  // TODO support dimmer events
  if (status.name === 'ON' || status.name === 'OFF') {
    var message = JSON.stringify({ command: "knxbusdata", data: deviceId + " " + (status.name === 'ON' ? 1 : 0) });
    ws.send(message);
    logger.debug('sent knxbusdata', message);
  }
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
