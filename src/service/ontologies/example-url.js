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
                "file_name": "../example/file_urls.json",
                "file_format": "json"
            }
        }
    ],
    "bolts": [
        {
            "name": "document-type",
            "type": "inproc",
            "working_dir": "./bolts",
            "cmd": "document-type.js",
            "inputs": [{
                "source": "text-input-reader",
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
                "source": "document-type",
            }],
            "init": {
                // textract specific configurations
                "text_config": {
                    "preserveLineBreaks": false,
                    "includeAltText": false
                },
                "text_url_path": "url",
                "text_type_path": "type",
                "text_path": "metadata.text",
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
                // wikifier related configurations
                "wikifier": {
                    "userKey": config.wikifier.userKey,
                    "wikifierUrl": config.wikifier.wikifierUrl,
                },
                "text_path": "metadata.text",
                "concept_path": "metadata.wiki"
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
                "file_name_template": "../example/example_url_output.json"
            }
        },
        {
            "name": "file-error-listener",
            "working_dir": ".",
            "type": "sys",
            "cmd": "console",
            "inputs": [
                {
                    "source": "document-type",
                    "stream_id": "stream_error"
                },
                {
                    "source": "text-content-extraction",
                    "stream_id": "stream_error"
                },
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