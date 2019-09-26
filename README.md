# Document Enrichment Tool

The tool is intended to enrich text/documents - extracting the content and provide
various annotations and labels to it.

The usage of the tool is presented in the [service](./src/service) folder and
includes some examples of its use.

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

### Textract Dependencies

### Textract

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
