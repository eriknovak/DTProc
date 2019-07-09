/********************************************************************
 * Material: Type
 * This component extracts the material type using the material
 * origin url and assigns an object containing the extention and
 * mimetype of the material.
 */

// external libraries
const http = require('http');
const https = require('https');
// file type detection/extraction libraries
const fileTypeManual   = require('mime-types');
const fileTypeResponse = require('file-type');

/**
 * Formats Material into a common schema.
 */
class MaterialFormat {

    constructor() {
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    init(name, config, context, callback) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[MaterialFormat ${this._name}]`;
        // which field to use to check the material type
        this._documentUrlPath = config.url_path;
        // where to store the document type
        this._documentTypePath = config.type_path;
        // where to store the errors if any
        this._documentErrorPath = config.error_path || 'error';
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
        // get the material url
        let materialUrl = this.get(message, this._documentUrlPath);
        // get the material type
        const materialType = this.get(message, this._documentTypePath);

        if (materialType && materialType.ext && materialType.mime) {
            return this._onEmit(material, stream_id, callback);
        } else if (materialUrl) {
            // get the extension of the material
            const splitUrl = materialUrl.split('.');
            const ext = splitUrl[splitUrl.length - 1].toLowerCase();
            // get the mimetype from the extension
            const mime = fileTypeManual.lookup(ext);

            if (mime) {
                // was able to extract a valid mimetype from the extension
                message.type = { ext, mime };
                // the mimetype has been extracted from the extension
                return this._onEmit(message, stream_id, callback);

            } else if (materialUrl.indexOf('http://') === 0) {
                // make an http request and handle appropriately handle the objects
                return this._makeProtocolRequest(http, message, stream_id, callback);

            } else if (materialUrl.indexOf('https://') === 0) {
                // make an https request and handle appropriately handle the objects
                return this._makeProtocolRequest(https, message, stream_id, callback);
            } else {
                // cannot detect the protocol for getting materials
                message[this._documentErrorPath] = `${this._profix} Cannot detect protocol for getting materials`;
                return this._onEmit(message, 'stream_error', callback);
            }
        } else {
            // unable to get the url of the material
            message[this._documentErrorPath] = `${this._prefix} No material url provided`;
            return this._onEmit(message, 'stream_error', callback);
        }
    }


    /**
     * @description Makes an http(s) request and handles the response.
     * @param {Object} protocol - The protocol used to get the material.
     * Must be one of http, https objects.
     * @param {Object} message - The material object. Contains the material attributes.
     * @param {String} stream_id - The QTopology stream id.
     * @param {Function} callback - The callback function provided by qtolopogy.
     */
    _makeProtocolRequest(protocol, message, stream_id, callback) {
        let self = this;

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
     * @description Extracts the material type using the response.
     * @param {Object} response - The http(s) response.
     * @param {Object} message - The material object. Contains the material attributes.
     * @param {String} stream_id - The qtopology stream id.
     * @param {Function} callback - The callback function provided by qtopology.
     */
    _handleHTTPResponse(response, message, stream_id, callback) {
        const statusCode = response.statusCode;
        if (statusCode !== 200) {
            // send formated material to the next component
            message[this._documentErrorPath] = `${this._prefix} Error when making a request, invalid status code= ${statusCode}`;
            return this._onEmit(message, 'stream_error', callback);
        } else {
            response.on('readable', (d) => {
                // get the minimum number of bytes to detect type
                const chunk = response.read(fileTypeResponse.minimumBytes);
                // destroy the response of the http(s)
                response.destroy();
                // assign the material type

                if (chunk) {
                    this.set(message, this._documentTypePath, fileTypeResponse(chunk));
                    return this._onEmit(message, stream_id, callback);
                } else {
                    // send formated material to the next component
                    message[this._documentErrorPath] = `${this._prefix} Error when making request, response object empty`;
                    return this._onEmit(message, 'stream_error', callback);
                }


            });
        }
    }

}

exports.create = function (context) {
    return new MaterialFormat(context);
};