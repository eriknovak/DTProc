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
                file_name: "../example/file_text.jl",
                file_format: "json"
            }
        }
    ],
    bolts: [
        {
            name: "extract-wikipedia",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "wikipedia_bolt.js",
            inputs: [{
                source: "text-input-reader",
            }],
            init: {
                wikifier: {
                    user_key: config.wikifier.userKey,
                    wikifier_url: config.wikifier.wikifierURL,
                },
                document_text_path: "text",
                document_error_path: "error",
                wikipedia_concept_path: "wiki"
            }
        },
        {
            name: "file-append",
            working_dir: ".",
            type: "sys",
            cmd: "file_append",
            inputs: [
                { source: "extract-wikipedia" }
            ],
            init: {
                file_name_template: "../example/example_text_output.jl"
            }
        },
        {
            name: "file-error-listener",
            working_dir: ".",
            type: "sys",
            cmd: "console",
            inputs: [
                {
                    source: "extract-wikipedia",
                    stream_id: "stream_error"
                }
            ],
            init: {}
        }
    ],
    variables: {}
};
