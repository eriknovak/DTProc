/********************************************************************
 * Extract: Wikipedia
 * This component wikifies the OER material using the raw text extracted in the
 * previous steps of the pre-processing pipeline. The wikipedia concepts are then
 * stored within the material object and sent to the next component.
 */

// basic bolt template
const BasicBolt = require('./basic-bolt');

/**
 * Extracts wikipedia concepts out of the document content.
 */
class ExtractWikipedia extends BasicBolt {

    constructor() {
        super();
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    init(name, config, context, callback) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[Wikification ${this._name}]`;

        // wikifier request instance
        this._wikifier = require('@library/wikifier')(config.wikifier);

        // determine the text to use for wikipedia extraction
        this._documentTextPath = config.document_text_path;
        // determine the location to store the concepts
        this._wikipediaConceptPath = config.wikipedia_concept_path;
        // the path to where to store the error
        this._documentErrorPath = config.document_error_path || 'error';
        // use other fields from config to control your execution
        callback();
    }

    heartbeat() {
        // do something if needed
    }

    shutdown(callback) {
        // prepare for gracefull shutdown, e.g. save state
        callback();
    }

    receive(material, stream_id, callback) {
        let self = this;

       // get the raw text from the material
        let text = self.get(material, this._documentTextPath);

        if (!text) {
            //send it to the next component in the pipeline
            material[self._documentErrorPath] = `${this._prefix} No text provided.`;
            return this._onEmit(material, 'stream_error', callback);
        }

        // process material text and extract wikipedia concepts
        self._wikifier.processText(text).then(response => {

            // retrieve wikifier results
            const { wikipedia } = response;

            if (!wikipedia.length) {
                // no wikipedia concepts extracted - send it to partial material table
                material[self._documentErrorPath] = `${this._prefix} No wikipedia concepts found`;
                return this._onEmit(material, 'stream_error', callback);
            }

            // store merged concepts within the material object
            self.set(material, this._wikipediaConceptPath, wikipedia);
            return this._onEmit(material, stream_id, callback);

        }).catch(error => {
            // there was an error - send the material to partial table
            material.message = `${this._prefix} ${error.message}`;
            return this._onEmit(material, stream_id, callback);
        });
    }

}

exports.create = function (context) {
    return new ExtractWikipedia(context);
};