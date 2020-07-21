# Document Enrichment Service
This tool is intended to process and enrich text documents. The user can modify
and/or create their own pipeline by defining the ontology file in the
`/ontologies` folder. Afterwards, the ontology can be started with the following
command:

```bash
node pipeline -tn {topology-name} -tp {topology-path}
```

To add new spouts and bolts, please look at the list of available components
in the `qtopology` documentation found [here](https://qminer.github.io/qtopology/std-nodes.html#rest-spout).


## Ontology Examples

### Processing From Text

This simple example shows how to process text that are already present in the
object sent to the pipeline. The example ontology is found in `ontologies/example-text.json`.

To run the ontology simply run

```bash
node pipeline -tn uuid.topology.text -tp ../ontologies/example-text
```

The output should be available in the [example](../example) folder in the `example_text_output.json` file.


### Processing via URL

This example shows how to process text that are not present in the object but there is
an URL field available to the object sent to the pipeline. This ontology identifies the
document type found at the URL, extract the content as text, wikify the content and
store it. The ontology is found in `ontologies/example-url.json`.

To run the ontology run

```bash
node pipeline -tn uuid.topology.url -tp ../ontologies/example-url
```

The output should be available in the [example](../example) folder in the `example_url_output.json` file.
