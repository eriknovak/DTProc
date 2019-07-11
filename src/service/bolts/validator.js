/********************************************************************
 * Material: Validation
 * This component validates the material object - checks if all of
 * the required attributes are present and sends them to the
 * appropriate stream.
 */


class MaterialValidator {

    constructor() {
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    init(name, config, context, callback) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[MaterialValidator ${this._name}]`;

        // initialize validator with
        this._validator = require('../../library/schema-validator')();
        // the validation schema
        this._schema = config.schema;

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
        // validate the provided material
        const validation = this._validator.validateSchema(message, this._schema);
        const stream_direction = validation.matching ? stream_id : 'stream_error';

        return this._onEmit(message, stream_direction, callback);
    }

}

exports.create = function (context) {
    return new MaterialValidator(context);
};