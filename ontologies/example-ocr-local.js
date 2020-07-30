// configurations
const { default: config } = require("../dist/config/config");

module.exports = {
    general: {
        heartbeat: 2000,
        pass_binary_messages: true
    },
    spouts: [
        {
            name: "file-reader",
            working_dir: ".",
            type: "sys",
            cmd: "file_reader",
            init: {
                file_name: "../example/file_local.jl",
                file_format: "json"
            }
        }
    ],
    bolts: [
        {
            name: "doc-type",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "doc_type_bolt.js",
            inputs: [{
                source: "file-reader",
            }],
            init: {
                document_location_path: "path",
                document_type_path: "type"
            }
        },
        {
            name: "doc-ocr",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "ocr_bolt.js",
            inputs: [{
                source: "doc-type",
            }],
            init: {
                document_location_path: "path",
                document_location_type: "local",
                document_language_path: "language",
                document_ocr_path: "metadata.text",
                temporary_folder: "../tmp"
            }
        },
        {
            name: "wikipedia",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "wikipedia_bolt.js",
            inputs: [{
                source: "doc-ocr",
            }],
            init: {
                // wikifier related configurations
                wikifier: {
                    user_key: config.wikifier.userKey,
                    wikifier_url: config.wikifier.wikifierURL,
                    max_length: 10000
                },
                document_text_path: "metadata.text",
                wikipedia_concept_path: "metadata.wiki",
                document_error_path: "error"
            }
        },
        {
            name: "file-append",
            working_dir: ".",
            type: "sys",
            cmd: "file_append",
            inputs: [
                { source: "wikipedia" }
            ],
            init: {
                file_name_template: "../example/example_ocr_url_output.jl"
            }
        },
        {
            name: "file-error-listener",
            working_dir: ".",
            type: "sys",
            cmd: "console",
            inputs: [
                {
                    source: "doc-type",
                    stream_id: "stream_error"
                },
                {
                    source: "doc-ocr",
                    stream_id: "stream_error"
                },
                {
                    source: "wikipedia",
                    stream_id: "stream_error"
                }
            ],
            init: {}
        }

    ],
    variables: {}
};
