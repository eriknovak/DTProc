# Ontologies

This folder contains the different ontologies that represent how a document processing pipeline
should be constructed. The elements of an ontology are of two types:

**Spouts.** The spout definitions and documentation is found in [./src/components/spouts](../src/components/spouts/README.md).

**Bolts.** The spout definitions and documentation is found in [./src/components/bolts](../src/components/bolts/README.md).

## Prerequisites

**NOTE:** Before running the example ontologies, please address the environment variable 
settings found in [./env](../env/README.md).


## Running an Ontology

The framework is designed for easy creation of document and text processing pipelines. 
The user can modify and/or create their own pipelines by defining the ontology file in the
`/ontologies` folder. Afterwards, the ontology can be started with the following
command:

```bash
node pipeline -tn {topology-name} -tp {topology-path}
```

To add new spouts and bolts, please look at the list of available components
in the `qtopology` documentation found [here](https://qminer.github.io/qtopology/std-nodes.html#rest-spout).


## Ontology Examples

Here, we present some examples of how to construct an ontology.

### Example: Extract Document Content, Local
This simple example shows how to process a local document, extract its content and annotate it 
with the Wikipedia concepts. The metadata is stored in this [json file](../example/file_local.json).
The example ontology is stored in [./example-local](./example-local.json).

To run the ontology simply run

```bash
node ./dist/pipeline -tn uuid.topology.local -tp ./ontologies/example-local
```

The output should be available in the [example](../example) folder as the `example_local_output.json` file.


### Example: Extract Document Content, Text
This simple example shows how to process text that is already stored in the 
object in the [json file](../example/file_text.json). The example ontology is stored in [./example-text](./example-text.json).

To run the ontology simply run

```bash
node ./dist/pipeline -tn uuid.topology.text -tp ./ontologies/example-text
```

The output should be available in the [example](../example) folder as the `example_text_output.json` file.

### Example: Extract Document Content, URL
This simple example shows how to process a document that is stored remotely. The output should be 
similar to the one in **Extract Document Content, Local**. The file that contains the remote 
documents metadata (including location) is found [here](../example/file_urls.json).
The example ontology is stored in [./example-url](./example-url.json).

To run the ontology simply run

```bash
node ./dist/pipeline -tn uuid.topology.url -tp ./ontologies/example-url
```

The output should be available in the [example](../example) folder as the `example_url_output.json` file.



### Example: Extract Document Content, Text Translation via TTP
TODO


### Example: Extract Document Content, URL Translation via TTP
TODO
