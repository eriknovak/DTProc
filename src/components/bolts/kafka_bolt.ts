// interfaces
import * as INT from "../../Interfaces";

// modules
import KafkaProducer from "../../library/kafka-producer";
import BasicBolt from "./basic_bolt";

class KafkaBolt extends BasicBolt {

    private _kafkaProducer: KafkaProducer;
    private _kafkaTopic: string;
    private _formatMessage: INT.IFormatMessage;

    constructor() {
        super();
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    async init(name: string, config: INT.IKafkaBoltConfig, context: any) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[KafkaBolt ${this._name}]`;

        this._kafkaProducer = new KafkaProducer(config.kafka.host);
        this._kafkaTopic = config.kafka.topic;

        this._formatMessage = config.format_message;
    }

    heartbeat() {
        // do something if needed
    }

    async shutdown() {
        // shutdown component
    }

    async receive(message: any, stream_id: string) {

        if (this._formatMessage) {
            message = this._formatMessage(message);
        }

        // send the message to the database topics
        const promise = new Promise((resolve, reject) => {
            this._kafkaProducer.send(this._kafkaTopic, message, (error) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
        await promise;
        return;
    }
}

// create a new instance of the bolt
const create = () => new KafkaBolt();

export { create };