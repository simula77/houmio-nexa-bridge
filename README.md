houmio-nexa-bridge
==================

Node.js application that translates messages from [Houm.io](http://houm.io) user interface to commands for Nexa compatible electronics. A TellStick is required to communicate with [Nexa](http://www.nexa.se/) hardware.

##### Device ids in /etc/tellstick.conf must match the switch group address entered through houm.io UI.

##### Only on/off sockets are currently supported.

#### Requirements
* TellStick from [Telldus](http://www.telldus.se/products/tellstick)
* A Houm.io siteKey from http://houm.io
* Nexa or compatible home automation electronics
* a Computer such as a Raspberry Pi that runs node.js and the TellStick software. 

#### Running on a Raspberry Pi
* [Installing Telldus software on a Raspberry Pi](http://elinux.org/R-Pi_Tellstick_core)
* [Installing Node.js on a Raspberry Pi](https://learn.adafruit.com/raspberry-pi-hosting-node-red/setting-up-node-dot-js)
