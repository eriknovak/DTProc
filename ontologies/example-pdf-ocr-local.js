// configurations
const { default: config } = require("../dist/config/config");

module.exports = {
    general: {
        heartbeat: 2000,
        pass_binary_messages: true
    },
    spouts: [
        {
            name: "file-inputs",
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
                source: "file-inputs",
            }],
            init: {
                document_location_path: "path",
                document_type_path: "type"
            }
        },
        {
            name: "type-router",
            type: "sys",
            working_dir: ".",
            cmd: "router",
            inputs: [{
                source: "doc-type",
            }],
            init: {
                routes: {
                    pdf: {
                        "type.ext": ["pdf", "docx", "doc", "pptx", "ppt"],
                    },
                    doc: {
                        "type.ext": {
                            $like: "^(?!pdf|docx|doc|pptx|ppt).*$"
                        }
                    }
                },
            }
        },
        {
            name: "doc-text",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "text_bolt.js",
            inputs: [{
                source: "type-router",
                stream_id: "doc"
            }],
            init: {
                textract_config: {
                    preserve_line_breaks: false,
                    preserve_only_multiple_line_breaks: false,
                    include_alt_text: false
                },
                document_location_path: "path",
                document_location_type: "local",
                document_text_path: "metadata.text",
            }
        },
        {
            name: "doc-pdf",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "pdf_bolt.js",
            inputs: [{
                source: "type-router",
                stream_id: "pdf"
            }],
            init: {
                document_location_path: "path",
                document_location_type: "local",
                document_pdf_path: "metadata",
                pdf_extract_metadata: ["pages", "meta", "text"],
                pdf_trim_text: true,
                convert_to_pdf: true
            }
        },
        {
            name: "pdf-router",
            type: "sys",
            working_dir: ".",
            cmd: "router",
            inputs: [{
                source: "doc-pdf",
                stream_id: "pdf"
            }],
            init: {
                routes: {
                    pdf: {
                        "metadata.text": {
                            $like: "(?!^$)([^\s])"
                        }
                    },
                    ocr: {
                        "metadata.text": {
                            $like: "^$|^\s+$"
                        }
                    }
                },
            }
        },
        {
            name: "doc-ocr",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "ocr_bolt.js",
            inputs: [{
                source: "pdf-router",
                stream_id: "ocr"
            }],
            init: {
                document_location_path: "path",
                document_location_type: "local",
                document_language_path: "language",
                document_ocr_path: "metadata.text",
                temporary_folder: "../tmp",
                ocr_verbose: true
            }
        },
        {
            name: "wikipedia",
            type: "inproc",
            working_dir: "./components/bolts",
            cmd: "wikipedia_bolt.js",
            inputs: [{
                source: "doc-text",
                stream_id: "doc"
            }, {
                source: "pdf-router",
                stream_id: "pdf"
            }, {
                source: "doc-ocr",
                stream_id: "ocr"
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
                {
                    source: "wikipedia",
                    stream_id: "doc"
                },
                {
                    source: "wikipedia",
                    stream_id: "pdf"
                },
                {
                    source: "wikipedia",
                    stream_id: "ocr"
                }
            ],
            init: {
                file_name_template: "../example/example_pdf_ocr_output.jl"
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
                    source: "doc-text",
                    stream_id: "stream_error"
                },
                {
                    source: "doc-pdf",
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
