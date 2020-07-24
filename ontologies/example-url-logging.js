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
            name: "log-message-retrieval",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "log_postgresql_bolt.js",
            inputs: [{
                source: "text-input-reader",
            }],
            init: {
                pg: config.pg,
                postgres_table: "processing_queue",
                postgres_primary_id: "material_id",
                message_primary_id: "id",
                postgres_method: "upsert",
                postgres_message_attrs: {
                    title: "title",
                    language: "language"
                },
                postgres_time_attrs: {
                    start_process_date: true
                },
                postgres_literal_attrs: {
                    status: "Document retrieved"
                }
            }
        },
        {
            name: "document-type-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "document_type_bolt.js",
            inputs: [{
                source: "log-message-retrieval",
            }],
            init: {
                document_location_path: "url",
                document_type_path: "type"
            }
        },
        {
            name: "log-type-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "log_postgresql_bolt.js",
            inputs: [{
                source: "document-type-extraction",
            }],
            init: {
                pg: config.pg,
                postgres_table: "processing_queue",
                postgres_primary_id: "material_id",
                message_primary_id: "id",
                postgres_literal_attrs: {
                    status: "Document type extracted"
                },
                final_bolt: true
            }
        },
        {
            name: "document-content-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "text_bolt.js",
            inputs: [{
                source: "log-type-extraction",
            }],
            init: {
                textract_config: {
                    preserve_line_breaks: false,
                    preserve_only_multiple_line_breaks: false,
                    include_alt_text: false
                },
                document_location_path: "url",
                document_type_path: "type",
                document_text_path: "metadata.text",
            }
        },
        {
            name: "log-content-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "log_postgresql_bolt.js",
            inputs: [{
                source: "document-content-extraction",
            }],
            init: {
                pg: config.pg,
                postgres_table: "processing_queue",
                postgres_primary_id: "material_id",
                message_primary_id: "id",
                postgres_literal_attrs: {
                    status: "Document content extracted"
                },
                final_bolt: true
            }
        },
        {
            name: "wikipedia-concept-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "wikipedia_bolt.js",
            inputs: [{
                source: "log-content-extraction",
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
            name: "log-wikipedia-extraction",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "log_postgresql_bolt.js",
            inputs: [{
                source: "wikipedia-concept-extraction",
            }],
            init: {
                pg: config.pg,
                postgres_table: "processing_queue",
                postgres_primary_id: "material_id",
                message_primary_id: "id",
                postgres_literal_attrs: {
                    status: "Document processing successful"
                },
                final_bolt: true
            }
        },
        {
            name: "file-append",
            working_dir: ".",
            type: "sys",
            cmd: "file_append",
            inputs: [
                { source: "log-wikipedia-extraction" }
            ],
            init: {
                file_name_template: "../example/example_url_logging_output.jl"
            }
        },
        {
            name: "log-finished-processing",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "log_postgresql_bolt.js",
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
            init: {
                pg: config.pg,
                postgres_table: "processing_queue",
                postgres_primary_id: "material_id",
                message_primary_id: "id",
                postgres_message_attrs: {
                    status: "error"
                },
                final_bolt: true
            }
        }
    ],
    variables: {}
};
