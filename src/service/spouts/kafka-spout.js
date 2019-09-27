/************************************************
 * Kafka Consumer Spout
 * This component is listening to a Kafka topic
 * and then sends the message forward to the next
 * component in the topology.
 */

// import the kafka consumer
const KafkaConsumer = require('@library/kafka-consumer');

/**
 * @class KafkaSpout
 * @description Retrieves the messages provided by a Kafka topic and forwards it
 * to the next component of the topology.
 */
class KafkaSpout {

    constructor() {
        this._name = null;
        this._context = null;
        this._prefix = '';
        this._generator = null;
    }

    init(name, config, context, callback) {
        this._name = name;
        this._context = context;
        this._prefix = `[KafkaSpout ${this._name}]`;
        this._generator = new KafkaConsumer(config.kafka);
        callback();
    }

    heartbeat() {
    }

    shutdown(callback) {
        this._generator.stop(callback);
    }

    run() {
        this._generator.enable();
    }

    pause() {
        this._generator.disable();
    }

    next(callback) {
        callback(null, this._generator.next(), null, callback);
    }
}

exports.create = function () {
    return new KafkaSpout();
};
