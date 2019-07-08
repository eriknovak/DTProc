// configurations
const config = require('alias:config/config');

module.exports = {
    "general": {
        "heartbeat": 2000,
        "pass_binary_messages": true
    },
    "spouts": [
        {
            "name": "text-input",
            "type": "inproc",
            "working_dir": "./spouts",
            "cmd": "kafka-spout.js",
            "init": {
                // "kafka_host": config.kafka.host,
                // "topic": "PROCESSING.MATERIAL.TEXT",
                // "group_id": `${config.kafka.groupId}-text`
            }
        },
        //
        {
            "name": "text-input-reader",
            "working_dir": ".",
            "type": "sys",
            "cmd": "file_reader",
            "init": {
                "file_name": "/some/file.txt",
                "file_format": "json"
            }
        }
    ],
    "bolts": [
        {
            "name": "material-format",
            "type": "inproc",
            "working_dir": "./bolts",
            "cmd": "material-format.js",
            "inputs": [{
                // modify the sources - names of the spouts
                "source": "text-input"
            }],
            "init": {
                "fields": [
                    // an array of the fields to be take in consideration
                    // { "name": "title" },
                ]
            }
        },
        {
            "name": "material-type",
            "type": "inproc",
            "working_dir": "./bolts",
            "cmd": "material-type.js",
            "inputs": [{
                "source": "material-format",
            }],
            "init": {
                "url_path": "url",
                "type_path": "type"
            }
        },
        {
            "name": "text-content-extraction",
            "type": "inproc",
            "working_dir": "./bolts",
            "cmd": "extraction-text.js",
            "inputs": [{
                "source": "material-type",
            }],
            "init": {
                "text_config": {
                    "preserveLineBreaks": true,
                    "includeAltText": true
                },
                "text_url_path": "url",
                "text_type_path": "type",
                "text_path": "text",
            }
        },
        {
            "name": "wikification",
            "type": "inproc",
            "working_dir": "./bolts",
            "cmd": "extraction-wikipedia.js",
            "inputs": [{
                "source": "text-content-extraction",
            }],
            "init": {
                "wikifier": {
                    "userKey": config.preproc.wikifier.userKey,
                    "wikifierUrl": config.preproc.wikifier.wikifierUrl,
                },
                "text_path": "text",
                "concept_path": "wiki"
            }
        },
        {
            "name": "material-validator",
            "type": "inproc",
            "working_dir": "./bolts",
            "cmd": "material-validator.js",
            "inputs": [{
                "source": "wikification",
            }],
            "init": {
            }
        },


    ],
    "variables": {}
};