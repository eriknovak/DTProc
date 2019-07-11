// configurations
const config = require('../../config/config');

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
            "name": "wikification",
            "type": "inproc",
            "working_dir": "./bolts",
            "cmd": "extraction-wikipedia.js",
            "inputs": [{
                "source": "text-input-reader",
            }],
            "init": {
                "wikifier": {
                    "userKey": config.wikifier.userKey,
                    "wikifierUrl": config.wikifier.wikifierUrl,
                },
                "text_path": "text",
                "concept_path": "wiki"
            }
        },
        {
            "name": "file-append",
            "working_dir": ".",
            "type": "sys",
            "cmd": "file_append",
            "inputs": [
                { "source": "wikification" }
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
                    "source": "wikification",
                    "stream_id": "stream_error"
                }
            ],
            "init": {}
        }


    ],
    "variables": {}
};