/********************************************************************
 * Extraction: Text
 * This component extracts raw content text from the file provided.
 * To do this we use textract <https://github.com/dbashford/textract>
 * which is a text extraction library. It returns the content in raw
 * text.
 */

// external libraries
const textract = require('alias:lib/textract');



/**
 * Formats Material into a common schema.
 */
class ExtractionText {

    constructor() {
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
        this.textConfig = config.text_config;
        // text extraction fields
        this._documentUrlPath = config.text_url_path;
        // text extraction result fields
        this._documentTypePath = config.text_type_path;
        // the path to where to store the text
        this._documentTextPath = config.text_path;

        // create the postgres connection
        this._pg = require('alias:lib/postgresQL')(config.pg);
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

    /**
     * @description Extracts the data from the object.
     * @param {Object} object - The object from which we wish to extract information.
     * @param {String} path - The path of the value to be extracted.
     */
    get(object, path) {
        let schema = object;
        let pathList = path.split('.');
        for (let val of pathList) {
            schema = schema[val];
        }
        return schema;
    }

    /**
     * @description Sets the value from the object.
     * @param {Object} object - The object from which we wish to set value.
     * @param {String} path - The path of the value to be assigned.
     * @param {Object} value - The value to be assigned.
     */
    set(object, path, value) {
        let schema = object;
        let pathList = path.split('.');
        let pathLength = pathList.length;
        for (let i = 0; i < pathLength - 1; i++) {
            var el = pathList[i];
            if (!schema[el]) {
                schema[el] = {};
            }
            schema = schema[el];
        }
        schema[pathList[pathLength - 1]] = value;
    }

    receive(message, stream_id, callback) {
        const self = this;

        const materialUrl = self.get(message, this._documentUrlPath);
        const materialType = self.get(message, this._documentTypePath);

        if (materialType && !this._invalidTypes.includes(materialType.ext)) {
            // extract raw text from materialURL
            textract.fromUrl(materialUrl, self.textConfig, (error, text) => {
                if (error) {
                    message.message = `${this._prefix} Not able to extract text.`;
                    return this._changeStatus(message, 'stream_error', callback);
                }
                // save the raw text within the metadata
                this.set(message, this._documentTextPath, text);
                return this._onEmit(message, stream_id, callback);
            });
        } else {
            // send the material to the partial table
            message.message = `${this._prefix} Material does not have type provided.`;
            return this._onEmit(message, 'stream_error', callback)
        }
    }

}

exports.create = function (context) {
    return new ExtractionText(context);
};