# DTProc: Document and Text Processing Framework

[![](https://badgen.net/github/release/ErikNovak/DTProc)](https://github.com/ErikNovak/DTProc/release/)

The framework is enables to process documents and text by extracting the documents content,
annotating and translating the text, and validating the output.

The framework is developed in TypeScript, but can be easily used on NodeJS.

The service is based on the [qtopology](https://github.com/qminer/qtopology) module,
which is a distributed stream processing layer and is able to construct components
for adding them to the tool.

## Prerequisites

- Create `.env` file in the `src/config` folder. See instructions described in this [readme](./src/config/README.md).

- node.js v6.0 and npm 5.3 or higher

    To test that your node.js version is correct, run `node --version` and `npm --version`.


## Install

To install the project run

```bash
npm install
```

## Build

To build the project and use the developed components run
```bash
npm run build
```

## Table of Contents

- [Bolts.](./src/components/bolts) The bolts used to process the documents and text.
- [Spouts.](./src/components/spouts) The spouts used to retrieve the metadata and send them to the bolts.
- [Ontologies.](./ontologies) The ontologies definition and examples.


### Textract Dependencies

The pipeline uses a nodejs module called [textract](./lib/textract) which allows
text extraction of most of text files. For some file types additional libraries need to be installed:

- **PDF** extraction requires `pdftotext` be installed, [link](http://www.xpdfreader.com/download.html).
- **DOC** extraction requires `antiword` be installed, [link](http://www.winfield.demon.nl/), unless on OSX
    in which case textutil (installed by default) is used.


# Acknowledgments

This work is developed by [AILab](http://ailab.ijs.si/) at [Jozef Stefan Institute](https://www.ijs.si/).

The work is supported by the X5GON and EnviroLENS projects.

The [X5GON](https://www.x5gon.org/) is a project connecting OER repositories and providing services
to improve the educational process. The [EnviroLens](https://envirolens.eu/) project is a project
that demonstrates and promotes the use of Earth observation as direct evidence for environmental
law enforcement, including in a court of law and in related contractual negotiations.
