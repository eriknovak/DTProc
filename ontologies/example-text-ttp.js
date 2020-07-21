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
                file_name: "../example/file_text.json",
                file_format: "json"
            }
        }
    ],
    bolts: [
        {
            name: "extract-text-ttp",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "extract-text-ttp.js",
            inputs: [{
                source: "text-input-reader",
            }],
            init: {
                ttp: {
                    user: config.ttp.user,
                    token: config.ttp.token,
                },
                tmp_folder: "../tmp",
                document_title_path: "title",
                document_language_path: "language",
                document_text_path: "text",
                document_transcriptions_path: "transcriptions",
                document_error_path: "error",
                ttp_id_path: "ttp_id"
            }
        },
        {
            name: "extract-wikipedia",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "extract-wikipedia.js",
            inputs: [{
                source: "extract-text-ttp",
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
                file_name_template: "../example/example_text_ttp_output.json"
            }
        },
        {
            name: "file-error-listener",
            working_dir: ".",
            type: "sys",
            cmd: "console",
            inputs: [
                {
                    source: "extract-text-ttp",
                    stream_id: "stream_error"
                },
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
