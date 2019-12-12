// internal modules
const PostgresRecords = require("@library/postgresql-records");

/**
 * @class PostgresqlSpout
 * @description Periodically retrieves the records from the postgreql table
 * and sends it to the
 */
class PostgresqlSpout {
    constructor() {
        this._name = null;
        this._context = null;
        this._prefix = "";
        this._generator = null;
    }

    init(name, config, context, callback) {
        this._name = name;
        this._context = context;
        this._prefix = `[PostgresqlSpout ${this._name}]`;
        this._generator = new PostgresRecords(
            config.pg,
            config.sql_statement,
            config.time_interval_millis
        );
        callback();
    }

    heartbeat() {
    }

    shutdown(callback) {
        this._generator.stop(callback);
    }

    run() {
        this._generator.enable();
    }

    pause() {
        this._generator.disable();
    }

    next(callback) {
        callback(null, this._generator.next(), null, callback);
    }
}

exports.create = function () {
    return new PostgresqlSpout();
};
