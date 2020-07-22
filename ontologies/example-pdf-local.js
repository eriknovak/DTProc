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
                file_name: "../example/file_local.json",
                file_format: "json"
            }
        }
    ],
    bolts: [
        {
            name: "extract-pdf-metadata",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "extract-pdf-raw.js",
            inputs: [{
                source: "text-input-reader",
            }],
            init: {
                document_location_path: "path",
                document_location_type: "local",
                document_pdf_path: "metadata.pdf",
                extract_metadata: ["pages", "info", "metadata", "text"]
            }
        },
        {
            name: "wikipedia-concept-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "extract-wikipedia.js",
            inputs: [{
                source: "extract-pdf-metadata",
            }],
            init: {
                // wikifier related configurations
                wikifier: {
                    user_key: config.wikifier.userKey,
                    wikifier_url: config.wikifier.wikifierURL,
                    max_length: 10000
                },
                document_text_path: "metadata.pdf.text",
                document_error_path: "error",
                wikipedia_concept_path: "metadata.wiki",
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
                file_name_template: "../example/example_pdf_local_output.json"
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
                    source: "document-content-extraction",
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