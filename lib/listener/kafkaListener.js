const kafka = require('kafka-node');
var kafkaMessageEvent = require('../event/kafkaMessageEvent');
const Consumer = kafka.Consumer;
const Offset = kafka.Offset;
var client = new kafka.Client('localhost:2181');
var offset = new Offset(client);

var topics = [{
    topic: 'skynet.topic', partition: 0, offset: 0
}];

var options = {
    autoCommit: true,
    autoCommitMsgCount: 100,
    autoCommitIntervalMs: 1000,
    fetchMaxWaitMs: 100,
    fetchMinBytes: 1,
    fetchMaxBytes: 1024 * 10,
    fromOffset: false,
    fromBeginning: false
};

var consumer = new Consumer(
    client,
    topics,
    options
);

consumer.on('message', function (message) {
    console.log(message.value);
    kafkaMessageEvent.emitMessage(message.value);
});

consumer.on('error', function (err) {
    console.log(err);
});

consumer.on('offsetOutOfRange', function (topic) {
    console.log('topic: ' + topic + ' ' + offsetOutOfRange);
    topic.maxNum = 2;
    offset.fetch([topic], function (err, offsets) {
        var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
    });
});

