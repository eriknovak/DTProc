// configurations
const config = require('@config/config');

module.exports = {
    "general": {
        "heartbeat": 2000,
        "pass_binary_messages": true
    },
    "spouts": [
        {
            "name": "text-input-reader",
            "working_dir": ".",
            "type": "sys",
            "cmd": "file_reader",
            "init": {
                "file_name": "../example/file_text.json",
                "file_format": "json"
            }
        }
    ],
    "bolts": [
        {
            "name": "extract-wikipedia",
            "type": "inproc",
            "working_dir": "./bolts",
            "cmd": "extract-wikipedia.js",
            "inputs": [{
                "source": "text-input-reader",
            }],
            "init": {
                "wikifier": {
                    "userKey": config.wikifier.userKey,
                    "wikifierUrl": config.wikifier.wikifierUrl,
                },
                "document_text_path": "text",
                "wikipedia_concept_path": "wiki"
            }
        },
        {
            "name": "file-append",
            "working_dir": ".",
            "type": "sys",
            "cmd": "file_append",
            "inputs": [
                { "source": "extract-wikipedia" }
            ],
            "init": {
                "file_name_template": "../example/example_text_output.json"
            }
        },
        {
            "name": "file-error-listener",
            "working_dir": ".",
            "type": "sys",
            "cmd": "console",
            "inputs": [
                {
                    "source": "extract-wikipedia",
                    "stream_id": "stream_error"
                }
            ],
            "init": {}
        }


    ],
    "variables": {}
};