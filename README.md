houmio-nexa-bridge
==================

Node.js application that translates messages from [h/oum.io](http://houm.io) user interface to commands for Nexa compatible electronics. A TellStick is required to communicate with Nexa hardware.

##### Device ids in /etc/tellstick.conf must match the switch group address entered through houm.io UI.

##### Only on/off sockets are currently supported.

### Requirement
* TellStick from [Telldus](http://www.telldus.se/products/tellstick)
* houm.io siteKey from http://houm.io
* Nexa or compatible home automation electronics
* computer such as a RaspberryPi that runs node.js and the TellStick software
