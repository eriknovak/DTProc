# QTopology Bolts

This folder contains custom bolts used for extracting different attributes of the
document. The standard qtopology bolts can be found [here](https://qminer.github.io/qtopology/std-nodes.html).


## Basic Bolt
The [basic bolt](./basic-bolt.js) is the template class from which all other bolts are extended.
It contains the `get` and `set` methods - used for getting and setting attributes of the message.

**GET.** The `get` method enables retrieving attributes from the message object. It accepts two
parameters:

| Parameter | Description                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| object    | The JSON object from which we want to retrieve an attribute                                                      |
| path      | The path to the attribute of the `path.to.attribute` format, where the dots signify the level of the JSON object |

For example, we have an `object`:

```json
{
    "title": "document name",
    "language": "en",
    "url": "http://www.example.com/document.pdf",
    "metadata": {
        "source": {
            "domain": "source name"
        }
    }
}
```
To retrieve the `"title"` of the `object` we would invoke `this.get(object, 'title')` and to
retrieve the `"domain"` attribute we would use `this.get(object, 'metadata.source.domain')`.

**SET.** The `set` method enables setting attributes inside the message object. It accepts three
parameters:

| Parameter | Description                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| object    | The JSON object from which we want to retrieve an attribute                                                      |
| path      | The path to the attribute of the `path.to.attribute` format, where the dots signify the level of the JSON object |
| value     | The value we wish to set                                                                                         |

If we take the previous `object` example, to set a new title we invoke `this.set(object, 'title', 'new document name')` and to
create a new attribute inside the `metadata` attribute, we can use `this.set(object, 'metadata.new_attribute', 0)`.

In addition, if the object doesn't already have an existing attribute object, the `set` method will create it. For example,
`this.set(object, 'path.to.new.attribute', 'hey')` will change the `object` to:

```json
{
    "title": "document name",
    "language": "en",
    "url": "http://www.example.com/document.pdf",
    "metadata": {
        "source": {
            "domain": "source name"
        }
    },
    "path": {
        "to": {
            "new": {
                "attribute": "hey"
            }
        }
    }
}
```


## Extract Document Type
The [extract document type](./extract-document-type.js) bolt is able to extract the type of the document based URL address of the document.
It requires the following parameters:

| Parameter           | Description                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------|
| document_url_path   | The path to the document URL address                                                               |
| document_type_path  | The path to the type object containing the extension (`ext`) and mimetype (`mime`) of the document |
| document_error_path | (optional) The path to store the error message (Default: `error`)                                  |

The schema for this bolt in the ontology is:

```json
{
    "name": "extract-document-type-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "extract-document-type.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "document_url_path": "url-path",
        "document_type_path": "type-path",
        "document_error_path": "error"
    }
}
```


## Extract PDF Raw
The [extract pdf raw](./extract-pdf-raw.js) bolt extracts the requested PDF metadata and content. In addition, it is able to convert a
microsoft office file into PDF before extracting the PDF metadata and content (**NOTE:** requires [libreoffice](https://www.libreoffice.org/)
to use the conversion feature). It requires the following parameters:

| Parameter                                          | Description                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------|
| document_location_path                             | The path to the document location                                                                  |
| document_location_type                             | The type of the document location. Options: `local` - for local documents, `remote` - for documents provided by an URL. (default: `remote`) |
| document_pdf_path                                  | The path where the pdf metadata and content is stored                                              |
| document_error_path                                | (optional) The path to store the error message (default: `error`)                                  |
| pdf_extract_metadata                               | (optional) The PDF values to be extracted (default: `["pages", "info", "metadata", "text"]`)       |
| convert_to_pdf                                     | (optional) The boolean value if the files should be converted to PDF; requires installed `libreoffice` (default: `false`)   |

The schema for this bolt in the ontology is:

```json
{
    "name": "extract-pdf-raw-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "extract-pdf-raw.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "document_location_path": "url-path",
        "document_location_type": "remote",
        "document_pdf_path": "text-path",
        "document_error_path": "error",
        "pdf_extract_metadata": ["pages", "info", "metadata", "text"],
        "convert_to_pdf": false
    }
}
```


## Extract Text Raw
The [extract text raw](./extract-text-raw.js) bolt is able to extract the document content in text format. The content is
extracted through the document URL address using the [textract](https://www.npmjs.com/package/textract) library and requires
the following parameters:

| Parameter                                          | Description                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------|
| document_location_path                             | The path to the document location                                                                  |
| document_location_type                             | The type of the document location. Options: `local` - for local documents, `remote` - for documents provided by an URL. (default: `remote`)                                                                                                                             |
| document_text_path                                 | The path where the document content text is stored                                                 |
| document_error_path                                | (optional) The path to store the error message (default: `error`)                                  |
| textract_config                                    | (optional) The textract configuration files (default: `{}`)                                        |
| textract_config.preserve_line_breaks               | (optional) Pass this in as `true` and textract will not strip any line breaks (default: `false`)   |
| textract_config.preserve_only_multiple_line_breaks | (optional) Some extractors, like PDF, insert line breaks at the end of every line, even if the middle of a sentence. If this option is set to `true`, then any instances of a single line break are removed but multiple line breaks are preserved. Check your output with this option, though, this doesn't preserve paragraphs unless there are multiple breaks (default: `false`) |
| textract_config.include_alt_text                   | (optional) If `true`, when extracting HTML whether or not to include alt text with the extracted text. (default: `false`) |

The schema for this bolt in the ontology is:

```json
{
    "name": "extract-text-raw-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "extract-text-raw.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "textract_config": {
            "preserve_line_breaks": false,
            "preserve_only_multiple_line_breaks": false,
            "include_alt_text": false
        },
        "document_location_path": "url-path",
        "document_location_type": "remote",
        "document_text_path": "text-path",
        "document_error_path": "error"
    }
}
```


## Extract Text TTP
The [extract text ttp](./extract-text-ttp.js) bolt sends a request to [MLLP](https://ttp.mllp.upv.es/index.php), the media
transcription and translation platform, and gets the translations of the provided text. The service is payable but also provide
an [experimental account](https://ttp.mllp.upv.es/index.php?page=register). To send the request, the following parameters need to be provided:

| Parameter                                          | Description                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------|
| document_language_path                             | The path to the document language                                                                  |
| document_title_path                                | The path to the document title                                                                     |
| document_text_path                                 | The path to the document text                                                                      |
| document_transcriptions_path                       | The path to where the transcriptions are saved                                                     |
| ttp_id_path                                        | The path to where the MLLP (TTP) id used for retrieving the metadata from MLLP is saved            |
| temporary_folder                                   | The folder path containing the temporary files generated when requesting the translations          |
| document_error_path                                | (optional) The path to store the error message (default: `error`)                                  |
| ttp                                                | The TTP configuration files                                                                        |
| ttp.user                                           | The TTP user name                                                                                  |
| ttp.token                                          | The TTP token used for sending requests                                                            |
| ttp.url                                            | (optional) The base URL for sending requests to get text translation (default: `https://ttp.mllp.upv.es/api/v3/text`)                                                            |
| ttp.languages                                      | (optional) The object containing the ISO 639-1 code languages in which the text would be translated  (default: `{ es: {}, en: {}, sl: {}, de: {}, fr: {}, it: {}, pt: {}, ca: {} }`) |
| ttp.formats                                        | (optional) The mapping of the formats in which the translations would be provided. The format options are available on the [TTP documentation](https://ttp.mllp.upv.es/doc/#Xt11500) page (default: `{ 3: "plain" }`) |
| ttp.timeout_millis                                 | (optional) The duration between to requests on the translation status (default: `120000`)          |

The schema for this bolt in the ontology is:

```json
{
    "name": "extract-text-ttp-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "extract-text-ttp.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "ttp": {
            "user": "ttp-username",
            "token": "ttp-token",
            "url": "https://ttp.mllp.upv.es/api/v3/text",
            "languages": {
                "es": {},
                "en": {},
                "sl": {},
                "de": {},
                "fr": {},
                "it": {},
                "pt": {},
                "ca": {}
            },
            "formats": {
                3: "plain"
            },
            "timeout_millis": 120000,
        },
        "document_language_path": "language-path",
        "document_title_path": "title-path",
        "document_text_path": "text-path",
        "document_transcriptions_path": "transcriptions-path",
        "document_error_path": "error",
        "ttp_id_path": "ttp-id-path",
        "temporary_folder": "./tmp"
    }
}
```


## Extract Video TTP
The [extract video ttp](./extract-video-ttp.js) bolt sends a request to [MLLP](https://ttp.mllp.upv.es/index.php), the media
transcription and translation platform, and gets the transcriptions and translations of the provided video. The service is
payable but also provide an [experimental account](https://ttp.mllp.upv.es/index.php?page=register) To send the request,
the following parameters need to be provided:

| Parameter                                          | Description                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------|
| document_language_path                             | The path to the document language                                                                  |
| document_location_path                             | The path to the document location                                                                  |
| document_authors_path                              | (optional) The path to the document authors (default: `null`)                                      |
| document_title_path                                | The path to the document title                                                                     |
| document_text_path                                 | The path to the document text                                                                      |
| document_transcriptions_path                       | The path to where the transcriptions are saved                                                     |
| ttp_id_path                                        | The path to where the MLLP (TTP) id used for retrieving the metadata from MLLP is saved            |
| temporary_folder                                   | The folder path containing the temporary files generated when requesting the translations          |
| document_error_path                                | (optional) The path to store the error message (default: `error`)                                  |
| ttp                                                | The TTP configuration files                                                                        |
| ttp.user                                           | The TTP user name                                                                                  |
| ttp.token                                          | The TTP token used for sending requests                                                            |
| ttp.url                                            | (optional) The base URL for sending requests to get video transcription and translation (default: `https://ttp.mllp.upv.es/api/v3/speech`)                                                            |
| ttp.languages                                      | (optional) The object containing the ISO 639-1 code languages in which the document would be translated  (default: `{ es: { sub: {} }, en: { sub: {} }, sl: { sub: {} }, de: { sub: {} }, fr: { sub: {} }, it: { sub: {} }, pt: { sub: {} }, ca: { sub: {} } }`) |
| ttp.formats                                        | (optional) The mapping of the formats in which the transcriptions and translations would be provided. The format options are available on the [TTP documentation](https://ttp.mllp.upv.es/doc/#X11500) page (default: `{ 0: "dfxp", 3: "webvtt", 4: "plain" }`) |
| ttp.timeout_millis                                 | (optional) The duration between to requests on the translation status (default: `120000`)          |

The schema for this bolt in the ontology is:

```json
{
    "name": "extract-video-ttp-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "extract-video-ttp.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "ttp": {
            "user": "ttp-username",
            "token": "ttp-token",
            "url": "https://ttp.mllp.upv.es/api/v3/speech",
            "languages": {
                "es": { "sub": {} },
                "en": { "sub": {} },
                "sl": { "sub": {} },
                "de": { "sub": {} },
                "fr": { "sub": {} },
                "it": { "sub": {} },
                "pt": { "sub": {} },
                "ca": { "sub": {} }
            },
            "formats": {
                0: "dfxp",
                3: "webvtt",
                4: "plain"
            },
            "timeout_millis": 120000,
        },
        "document_language_path": "language-path",
        "document_location_path": "location-path",
        "document_authors_path": null,
        "document_title_path": "title-path",
        "document_text_path": "text-path",
        "document_transcriptions_path": "transcriptions-path",
        "document_error_path": "error",
        "ttp_id_path": "ttp-id-path"
    }
}
```


## Extract Wikipedia
The [extract wikipedia](./extract-wikipedia.js) bolt leverages the [Wikifier](http://wikifier.org/) service for annotating
the document text with Wikipedia concepts. It requires the following parameters:

| Parameter              | Description                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------|
| document_text_path     | The path to the document content text                                                              |
| wikipedia_concept_path | The path to the document Wikipedia concept                                                         |
| document_error_path    | (optional) The path to store the error message (default: `error`)                                  |
| wikifier               | The wikifier configuration object                                                                  |
| wikifier.user_key      | The wikifier user key (can be acquired [here](http://wikifier.org/register.html))                  |
| wikifier.wikifier_url  | (optional) The wikifier URL endpoint (default: `'http://www.wikifier.org'`)                        |
| wikifier.max_length    | (optional) For longer text, the bolt will slice the text into chunks and aggregate the wikifier output into a single object. This parameter will setup the `max_length` of the text chunks. **Note:** it cannot be greater than `20000`, due to Wikifier restrictions (default: `10000`) |

The schema for this bolt in the ontology is:

```json
{
    "name": "extract-wikipedia-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "extract-wikipedia.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "wikifier": {
            "user_key": "wikifier-user-key",
            "wikifier_url": "http://wikifier.org",
            "max_length": 10000
        },
        "document_text_path": "text-path",
        "wikipedia_concept_path": "wikipedia-concept-path",
        "document_error_path": "error"
    }
}
```


## Forward Kafka
The [forward kafka](./forward-kafka.js) bolt sends the message to the given [Kafka](https://kafka.apache.org/) system, to a specific topic.
It requires the following parameters:

| Parameter              | Description                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------|
| format_message         | (optional) The function used to format the message (default: `null`)                               |
| kafka                  | The kafka configurations used in the component                                                     |
| kafka.host             | The kafka host                                                                                     |
| kafka.topic            | The kafka topic to which the message is sent                                                       |

The schema for this bolt in the ontology is:

```json
{
    "name": "forward-kafka-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "forward-kafka.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "kafka": {
            "host": "kafka-host",
            "topic": "kafka-topic"
        },
        "format_message": null
    }
}
```


## Message PostgreSQL
The [message postgresql](./message-postgresql.js) bolt updated a table in PostgreSQL database with the given
messages and literal attributes. It requires the following parameters:

| Parameter              | Description                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------|
| pg                     | The postgresql configurations used to connect to the database                                      |
| pg.host                | The postgresql host                                                                                |
| pg.port                | The postgresql port number                                                                         |
| pg.user                | The user connecting to the postgresql database                                                     |
| pg.password            | The password used to connect to the postgresql database                                            |
| pg.database            | The postgresql database name                                                                       |
| pg.max                 | (optional) The maximum number of connections with postgresql                                       |
| pg.idleTimeoutMillis   | (optional) The timeout milliseconds must pass before the connection becomes idle                   |
| pg.schema              | (optional) The schema name of the database tables to access the database                           |
| pg.version             | (optional) The version of the database to which we want to connect                                 |
| postgres_table         | The name of the postgresql table for updating the records                                          |
| postgres_method        | (optional) The method used for updating the records: `update` - update the record, `upsert` - update or insert the record (default: `update`) |
| postgres_primary_id    | The column in the postgresql table containing the primary IDs of the records                       |
| message_primary_id     | The attribute of the message containing the primary ID                                             |
| postgres_message_attrs | The dictionary telling which postgresql table column should be updated with which message attribute. Used for updating the table with message attributes. |
| postgres_literal_attrs | The dictionary telling which postgresql table column should be updated with which literal/static value. Used for updating the table with literal values.  |
| postgres_time_attrs    | The dictionary telling which postgresql table column should be updated with the current time.      |
| final_bolt             | (optional) Tells if the component is the final bolt or not (default: `false`)                      |
| document_error_path    | (optional) The path to store the error message (default: `error`)                                  |


The schema for this bolt in the ontology is:

```json
{
    "name": "message-postgresql-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "message-postgresql.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "pg": {
            "host": "pg-host",
            "port": "pg-port",
            "user": "pg-user",
            "password": "pg-password",
            "database": "pg-database",
            "max": 10,
            "idleTimeoutMillis": 10000,
            "schema": null,
            "version": null,
        },
        "postgres_table": "pg-table-name",
        "postgres_method": "update",
        "postgres_primary_id": "pg-primary-id",
        "message_primary_id": "message-primary-id",
        "postgres_message_attrs": {
            "column_name1": "message_attr1",
            "column_name2": "message_attr2",
        },
        "postgres_literal_attrs": {
            "column_name3": "give a specific message",
            "column_name4": 10,
        },
        "postgres_time_attrs": {
            "column_name5": true,
        },
        "postgres_time_attrs": {
            "column_name5": true,
        },
        "final_bolt": false,
        "document_error_path": "error"
    }
}
```


## Message Validate
The [message validate](./message-validate.js) bolt validates the if the message object has the structure and values
specified in the given json schema. The bolt adopts the [json schema](https://json-schema.org) format and accepts
the following parameters:

| Parameter           | Description                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------|
| json_schema         | The JSON schema used to validate the message structure. Must be of the [json schema](https://json-schema.org) format |
| document_error_path | (optional) The path to store the error message (default: `error`)                                                    |

The schema for this bolt in the ontology is:

```json
{
    "name": "message-validate-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "message-validate.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "json_schema": { },
        "document_error_path": "error"
    }
}
```

## Store PostgreSQL template
The [store postgresql template](./store-postgresql-template.js) bolt serves as a template for creating bolts which
stores the message attributes to different postgresql tables. **NOTE:** The bolt needs to be implemented to serve
the users specifications.

The minimum parameters that need to be present are:

| Parameter              | Description                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------|
| pg                     | The postgresql configurations used to connect to the database                                      |
| pg.host                | The postgresql host                                                                                |
| pg.port                | The postgresql port number                                                                         |
| pg.user                | The user connecting to the postgresql database                                                     |
| pg.password            | The password used to connect to the postgresql database                                            |
| pg.database            | The postgresql database name                                                                       |
| pg.max                 | (optional) The maximum number of connections with postgresql                                       |
| pg.idleTimeoutMillis   | (optional) The timeout milliseconds must pass before the connection becomes idle                   |
| pg.schema              | (optional) The schema name of the database tables to access the database                           |
| pg.version             | (optional) The version of the database to which we want to connect                                 |
| document_error_path    | (optional) The path to store the error message (default: `error`)                                  |


The schema for this bolt in the ontology is:

```json
{
    "name": "store-postgresql-template-component-name",
    "type": "inproc",
    "working_dir": "./components/bolts",
    "cmd": "store-postgresql-template.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "pg": {
            "host": "pg-host",
            "port": "pg-port",
            "user": "pg-user",
            "password": "pg-password",
            "database": "pg-database",
            "max": 10,
            "idleTimeoutMillis": 10000,
            "schema": null,
            "version": null,
        },
        "document_error_path": "error"
    }
}
```
