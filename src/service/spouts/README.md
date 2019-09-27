# QTopology Spouts

This folder contains custom spouts used for acquiring documents from different sources.
The standard qtopology spouts can be found [here](https://qminer.github.io/qtopology/std-nodes.html).

## Kafka Spout
The [kafka](./kafka-spout.js) spout connects to a given [Apache Kafka](https://kafka.apache.org/)
service and listens to a given topic. A kafka group ID can be assigned to the spout to have
multiple listeners on a given topic. It requires the following parameters.

| Parameter        | Description                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------|
| kafka            | the kafka connetion configuration                                                                                    |
| kafka.host       | the host address of the kafka service                                                                                |
| kafka.topic      | the name of the kafka topic the spout will listen                                                                    |
| kafka.group_id   | the kafka group id                                                                                                   |
| kafka.high_water | (optional) the maximum number of messages it can receive in the query before it pauses (default: `100`)              |
| kafka.low_water  | (optional) the minimum number of messages in can have before it starts again the message receiving (default: `10`)   |

The schema for this spout in the ontology is:

```json
{
    "name": "kafka-spout-name",
    "type": "inproc",
    "working_dir": "./spouts",
    "cmd": "kafka-spout.js",
    "init": {
        "kafka": {
            "host": "127.0.0.1:9092",
            "topic": "topic0",
            "group_id": "group0",
            "high_water": 100,
            "low_water": 10
        }
    }
}
```
