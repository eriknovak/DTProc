# Change Log
All notable changes to this project will be documented in this file.

## [0.1.0] - 2019-13-12
### Added
- New bolts
    - `extract-text-ttp`: used for retrieving translations from TTP
    - `extract-video-ttp`: used for retrieving transcriptions and translations from TTP
    - `kafka-message-forward`: (used for forwarding the messages to another kafka topic

- New spouts
    - `postgresql-spout`: used for periodically retriving records from PostgreSQL

- Additional attribute `language` to the example JSONs
- New ontologies for retrieving translations via TTP
- README documentation

## [0.0.2] - 2019-27-10
### Features
- Removed type validation from the `extract-text-raw` bolt and added support for extracting from local files ([0a1e4d8](https://github.com/ErikNovak/document-enrichment-tool/commit/0a1e4d863d342aab93e61ff51d710dc48a26f1a5))

### Added
- Example for processing local files ([0a1e4d8](https://github.com/ErikNovak/document-enrichment-tool/commit/0a1e4d863d342aab93e61ff51d710dc48a26f1a5))

## [0.0.1] - 2019-07-09
### Added
- The CHANGELOG for storing changes of the project
- Scripts for creating text processing pipelines
- Configuration files for projects
- Add example ontologies for enriching raw text and documents found at a given URL
- README documentation
