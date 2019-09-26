/********************************************************************
 * Material: Type
 * This component extracts the material type using the material
 * origin url and assigns an object containing the extention and
 * mimetype of the material.
 */

// basic bolt template
const BasicBolt = require('./basic-bolt');

// external libraries
const http = require('http');
const https = require('https');

// file type detection/extraction libraries
const fileTypeManual   = require('mime-types');
const fileTypeResponse = require('file-type');

/**
 * Formats Material into a common schema.
 */
class ExtractType extends BasicBolt {

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
        this._prefix = `[ExtractType ${this._name}]`;
        // which field to use to check the material type
        this._documentUrlPath = config.document_url_path;
        // where to store the document type
        this._documentTypePath = config.document_type_path;
        // where to store the errors if any
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
        // get the material url and type
        const materialUrl  = this.get(message, this._documentUrlPath);
        const materialType = this.get(message, this._documentTypePath);

        if (materialUrl && materialType && materialType.ext && materialType.mime) {
            // all values are present - continue to the next step
            return this._onEmit(material, stream_id, callback);
        }

        if (!materialUrl) {
            // unable to get the url of the material
            message[this._documentErrorPath] = `${this._prefix} No material url provided`;
            return this._onEmit(message, 'stream_error', callback);
        }


        // get the extension of the material
        const splitUrl = materialUrl.split('.');
        const ext = splitUrl[splitUrl.length - 1].toLowerCase();

        // get the mimetype from the extension
        const mime = fileTypeManual.lookup(ext);

        if (mime) {
            // assign the extension and mimetype to the message
            message[this._documentTypePath] = { ext, mime };
            return this._onEmit(message, stream_id, callback);
        }

        // get the protocol for making the request
        let protocol = materialUrl.indexOf('http://') === 0  ? http  :
                       materialUrl.indexOf('https://') === 0 ? https : null;

        if (!protocol) {
            // cannot detect the protocol for getting materials
            message[this._documentErrorPath] = `${this._profix} Cannot detect protocol for getting materials`;
            return this._onEmit(message, 'stream_error', callback);
        }
        // make an request and handle appropriately handle the objects
        return this._makeProtocolRequest(protocol, message, stream_id, callback);
    }


    /**
     * @description Makes an http(s) request and handles the response.
     * @param {Object} protocol - The protocol used to get the document.
     * Must be one of http or https objects.
     * @param {Object} message - The document object. Contains the document attributes.
     * @param {String} stream_id - The qtopology stream id.
     * @param {Function} callback - The callback function provided by qtolopogy.
     */
    _makeProtocolRequest(protocol, message, stream_id, callback) {
        let self = this;
        // extract the material url
        const materialUrl = this.get(message, this._documentUrlPath);

        // make the protocol request and handle the response
        protocol.get(materialUrl, response => {
            // handle the given response
            this._handleHTTPResponse(response, message, stream_id, callback);
        }).on('error', error => {
            // send formated material to the next component
            message[this._documentErrorPath] = `${self._prefix} Error when making an http(s) request= ${error.message}`;
            return this._onEmit(message, 'stream_error', callback);
        });
    }


    /**
     * @description Extracts the document type using the response.
     * @param {Object} response - The http(s) response.
     * @param {Object} message - The document object. Contains the document attributes.
     * @param {String} stream_id - The qtopology stream id.
     * @param {Function} callback - The callback function provided by qtopology.
     */
    _handleHTTPResponse(response, message, stream_id, callback) {
        // get the response status
        const statusCode = response.statusCode;

        if (statusCode !== 200) {
            // assign the error message and stop the process
            message[this._documentErrorPath] = `${this._prefix} Error when making a request, invalid status code= ${statusCode}`;
            return this._onEmit(message, 'stream_error', callback);
        }

        // start reading the response when possible
        response.on('readable', () => {
            // get the minimum number of bytes to detect type
            const chunk = response.read(fileTypeResponse.minimumBytes);
            // destroy the response of the http(s)
            response.destroy();

            if (!chunk) {
                // assign the error message and stop the process
                message[this._documentErrorPath] = `${this._prefix} Error when making request, response object empty`;
                return this._onEmit(message, 'stream_error', callback);
            }

            // assign the extension and mimetype to the message
            this.set(message, this._documentTypePath, fileTypeResponse(chunk));
            return this._onEmit(message, stream_id, callback);
        });
    }

}

exports.create = function (context) {
    return new ExtractType(context);
};