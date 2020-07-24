// configurations
const { default: config } = require("../dist/config/config");

module.exports = {
    general: {
        heartbeat: 2000,
        pass_binary_messages: true
    },
    spouts: [
        {
            name: "text-input-reader",
            working_dir: ".",
            type: "sys",
            cmd: "file_reader",
            init: {
                file_name: "../example/file_urls.jl",
                file_format: "json"
            }
        }
    ],
    bolts: [
        {
            name: "document-type-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "doc_type_bolt.js",
            inputs: [{
                source: "text-input-reader",
            }],
            init: {
                document_location_path: "url",
                document_type_path: "type"
            }
        },
        {
            name: "extract-ocr-metadata",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "ocr_bolt.js",
            inputs: [{
                source: "document-type-extraction",
            }],
            init: {
                document_location_path: "url",
                document_location_type: "remote",
                document_language_path: "language",
                document_ocr_path: "metadata.text",
                temporary_folder: "../tmp"
            }
        },
        {
            name: "wikipedia-concept-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "wikipedia_bolt.js",
            inputs: [{
                source: "extract-ocr-metadata",
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
                { source: "wikipedia-concept-extraction" }
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
                    source: "document-type-extraction",
                    stream_id: "stream_error"
                },
                {
                    source: "extract-ocr-metadata",
                    stream_id: "stream_error"
                },
                {
                    source: "wikipedia-concept-extraction",
                    stream_id: "stream_error"
                }
            ],
            init: {}
        }

    ],
    variables: {}
};
