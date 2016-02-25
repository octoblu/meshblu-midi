var help = require('midi-help');
var midi = require('midi');

input = new midi.input();
parser = new help.MidiParser();

input.on('message', function(deltaTime, message) {
  parser.parseArray(message);
});

console.log('Opening port:', input.getPortName(0));
input.openPort(0);

parser.on('noteOn', function(note, velocity, channel){
  console.log('noteOn:', note, velocity, channel);
});

parser.on('noteOff', function(note, velocity, channel){
  console.log('noteOff:', note, velocity, channel);
});

parser.on('cc', function(note, velocity, channel){
  console.log('cc:', note, velocity, channel);
});
