# QTopology Bolts

This folder contains custom bolts used for extracting different attributes of the
document.


## Basic Bolt
The [basic bolt](./basic-bolt.js) is the template class from which all other bolts are extended.
It contains the `get` and `set` methods - used for getting and setting attributes of the message.

**GET.** The `get` method enables retrieving attributes from the message object. It accepts two
parameters.

| Parameter | Description                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| object    | the JSON object from which we want to retrieve an attribute                                                      |
| path      | the path to the attribute of the `path.to.attribute` format, where the dots signify the level of the JSON object |

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
To retrieve the `"title"` of the `object` we would invoke `this.get(object, 'title')`, and to
retrieve the `"domain"` attribute we would use `this.get(object, 'metadata.source.domain')`.

**SET.** The `set` method enables setting attributes inside the message object. It accepts three
parameters.

| Parameter | Description                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| object    | the JSON object from which we want to retrieve an attribute                                                      |
| path      | the path to the attribute of the `path.to.attribute` format, where the dots signify the level of the JSON object |
| value     | the value we wish to set                                                                                         |

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


## Extract Type
The [extract type](./extract-type.js) bolt is able to extract the type of the document based URL address of the document.
There are two parameters that need to be set in this bolt.

| Parameter           | Description                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------|
| document_url_path   | the path to the document URL address                                                               |
| document_type_path  | the path to the type object containing the extension (`ext`) and mimetype (`mime`) of the document |
| document_error_path | (optional) the path to store the error message (Default: `error`)                                  |

The schema for this bolt in the ontology is:

```json
{
    "name": "document-type-extraction-name",
    "type": "inproc",
    "working_dir": "./bolts",
    "cmd": "extract-type.js",
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

## Extract Wikipedia
The [extract wikipedia](./extract-wikipedia.js) bolt leverages the [Wikifier](http://wikifier.org/) service for annotating
the document text with Wikipedia concepts. It requires the following parameters.

| Parameter              | Description                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------|
| document_text_path     | the path to the document content text                                                              |
| wikipedia_concept_path | the path to the document Wikipedia concept                                                         |
| document_error_path    | (optional) the path to store the error message (default: `error`)                                  |
| wikifier               | the wikifier configuration object                                                                  |
| wikifier.userKey       | the wikifier user key (can be acquired [here](http://wikifier.org/register.html))                  |
| wikifier.wikifierUrl   | (optional) the wikifier URL endpoint (default: `'http://www.wikifier.org'`)                        |
| wikifier.maxLength     | (optional) for longer text, the bolt will slice the text into chunks and aggregate the wikifier output into a single object. This parameter will setup the maxLength of the text chunks. **Note:** it cannot be greater than 20000, due to Wikifier restrictions (default: `10000`) |

The schema for this bolt in the ontology is:

```json
{
    "name": "wikipedia-concept-extraction-name",
    "type": "inproc",
    "working_dir": "./bolts",
    "cmd": "extract-wikipedia.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "wikifier": {
            "userKey": "wikifier-user-key",
            "wikifierUrl": "http://wikifier.org",
            "maxLength": 10000
        },
        "document_text_path": "text-path",
        "wikipedia_concept_path": "wikipedia-concept-path",
        "document_error_path": "error"
    }
}
```


## Extract Text Raw
The [extract text raw](./extract-text-raw.js) bolt is able to extract the document content in text format. The content is
extracted through the document URL address using the [textract](https://www.npmjs.com/package/textract) library and requires
the following parameters.

| Parameter                                      | Description                                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------|
| document_url_path                              | the path to the document URL address                                                               |
| document_type_path                             | the path to the type object containing the extension (`ext`) and mimetype (`mime`) of the document |
| document_text_path                             | the path to the document content text                                                              |
| document_error_path                            | (optional) the path to store the error message (default: `error`)                                  |
| textract_config                                | (optional) the textract configuration files (default: `{}`)                                        |
| textract_config.preserveLineBreaks             | (optional) pass this in as `true` and textract will not strip any line breaks (default: `false`)   |
| textract_config.preserveOnlyMultipleLineBreaks | (optional) some extractors, like PDF, insert line breaks at the end of every line, even if the middle of a sentence. If this option is set to `true`, then any instances of a single line break are removed but multiple line breaks are preserved. Check your output with this option, though, this doesn't preserve paragraphs unless there are multiple breaks (default: `false`) |
| textract_config.includeAltText                 | (optional) if `true`, when extracting HTML whether or not to include alt text with the extracted text. (default: `false`) |

The schema for this bolt in the ontology is:

```json
{
    "name": "document-content-extraction-name",
    "type": "inproc",
    "working_dir": "./bolts",
    "cmd": "extract-text-raw.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "textract_config": {
            "preserveLineBreaks": false,
            "preserveOnlyMultipleLineBreaks": false,
            "includeAltText": false
        },
        "document_url_path": "url-path",
        "document_type_path": "type-path",
        "document_text_path": "text-path",
        "document_error_path": "error"
    }
}
```

## Store PostgresQL
TODO

## Object Validator
The [object validator](./validator.js) bolt validates the if the message object has the structure and values
specified in the given json schema. The bolt adopts the [json schema](https://json-schema.org) format and accepts
the following parameters.

| Parameter           | Description                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------|
| json_schema         | the JSON schema used to validate the message structure. Must be of the [json schema](https://json-schema.org) format |
| document_error_path | (optional) the path to store the error message (default: `error`)                                                    |

The schema for this bolt in the ontology is:

```json
{
    "name": "validator-name",
    "type": "inproc",
    "working_dir": "./bolts",
    "cmd": "validator.js",
    "inputs": [{
        "source": "source-spout-or-bolt-name",
    }],
    "init": {
        "json_schema": { },
        "document_error_path": "error"
    }
}
```