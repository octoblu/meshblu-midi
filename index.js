'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-midi')
var help = require('midi-help');
var midi = require('midi');
var _ = require('lodash');
var active = false;

var input = new midi.input();
var parser = new help.MidiParser();

input.on('message', function(deltaTime, message) {
  parser.parseArray(message);
});

debug('Opening port:', input.getPortName(0));
input.openPort(0);

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    exampleString: {
      type: 'string',
      required: true
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    interval: {
      type: 'number',
      default: 200,
      required: true
    }
  }
};

function Plugin(){
  var self = this;
  self.options = {};
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  return self;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.events = function(){
  var self = this;
  active = true;

  var throttledEmit = _.throttle(function(payload){
   debug('throttled', payload);
   self.emit('message', {"devices": ['*'], "payload": payload});
 }, self.options.interval, {'leading': true});

  parser.on('noteOn', function(note, velocity, channel){
    debug('noteOn:', note, velocity, channel);
    throttledEmit({ "noteOn": {"note": note, "velocity": velocity, "channel": channel} });
  });

  parser.on('noteOff', function(note, velocity, channel){
    debug('noteOff:', note, velocity, channel);
    throttledEmit({ "noteOff": {"note": note, "velocity": velocity, "channel": channel} });
  });

  parser.on('cc', function(note, velocity, channel){
    debug('cc:', note, velocity, channel);
    throttledEmit({ "cc": {"note": note, "velocity": velocity, "channel": channel} });
  });

}

Plugin.prototype.onMessage = function(message){
  var self = this;
  var payload = message.payload;
};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options||{});
  if(active == false){
    self.events();
  }
};

Plugin.prototype.setOptions = function(options){
  var self = this;
  self.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
