/********************************************************************
 * Extract: Text Raw
 * This component extracts raw content text from the file provided.
 * To do this we use textract <https://github.com/dbashford/textract>
 * which is a text extraction library. It returns the content in raw
 * text.
 */

// basic bolt template
const BasicBolt = require('./basic-bolt');

// external libraries
const textract = require('@library/textract');

class ExtractTextRaw extends BasicBolt {

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
        this._prefix = `[ExtractionText ${this._name}]`;

        // set invalid types
        this._invalidTypes = config.invalid_types || [
            'zip',  // zip files
            'gz'    // zip files
        ];

        // configuration for textract
        this._textractConfig = config.textract_config || {};
        // the path to where to get the url
        this._documentUrlPath = config.document_url_path;
        // the path to where to get the type
        this._documentTypePath = config.document_type_path;
        // the path to where to store the text
        this._documentTextPath = config.document_text_path;
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

    receive(message, stream_id, callback) {
        const self = this;

        const materialUrl = self.get(message, this._documentUrlPath);
        const materialType = self.get(message, this._documentTypePath);

        if (materialType && !this._invalidTypes.includes(materialType.ext)) {
            // extract raw text from materialURL
            textract.fromUrl(materialUrl, self._textractConfig, (error, text) => {
                if (error) {
                    message[this._documentErrorPath] = `${this._prefix} Not able to extract text.`;
                    return this._onEmit(message, 'stream_error', callback)
                }
                // save the raw text within the metadata
                this.set(message, this._documentTextPath, text);
                return this._onEmit(message, stream_id, callback);
            });
        } else {
            // send the material to the partial table
            message[this._documentErrorPath] = `${this._prefix} Material does not have type provided.`;
            return this._onEmit(message, 'stream_error', callback)
        }
    }

}

exports.create = function (context) {
    return new ExtractTextRaw(context);
};