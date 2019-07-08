# Document Enrichment Service
This tool is intended to process and enrich text documents. The user can modify
and/or create their own pipeline by defining the ontology file in the
`/ontologies` folder. Afterwards, the ontology can be started with the following
command:

```bash
TOPOLOGY=name-of-ontology-file node pipeline.js
```

To add new spouts and bolts, please look at the list of available components
in the `qtopology` documentation found [here](https://qminer.github.io/qtopology/std-nodes.html#rest-spout).