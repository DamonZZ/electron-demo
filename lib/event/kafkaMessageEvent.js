const EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();

function onMessage(listener) {
    event.on('message',listener)
}

function emitMessage(message) {
    event.emit('message', message)
}

exports.onMessage = onMessage
exports.emitMessage = emitMessage
