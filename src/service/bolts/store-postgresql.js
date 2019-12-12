/** ******************************************************************
 * PostgresQL storage process for materials
 * This component receives the verified OER material object and
 * stores it into postgresQL database.
 */

const async = require("async");

class StorePostgreSQL {
    constructor() {
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    init(name, config, context, callback) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[StorePostgreSQL ${this._name}]`;

        // create the postgres connection
        this._pg = require("@library/postgresql")(config.pg);

        callback();
    }

    heartbeat() {
        // do something if needed
    }

    shutdown(callback) {
        // close connection to postgres database
        this._pg.close();
        // shutdown component
        callback();
    }

    receive(message, stream_id, callback) {
        let self = this;

        // get sent values
        const {
            // extract fields of the message
        } = message;

        // tasks container
        const tasks = [];

        // /////////////////////////////////////////
        // STORE THE ACTIONS IN THE TASKS
        // /////////////////////////////////////////

        // add the task of adding the
        tasks.push((xcallback) => {
            self._pg.insert(/* object, table_name, */ function (e, res) {
                if (e) { return xcallback(e); }
                return xcallback(null, 1);
            });
        });

        // /////////////////////////////////////////
        // RUN THE TASKS
        // /////////////////////////////////////////

        async.series(tasks, (e) => {
            if (e) { return callback(e); }
            return callback();
        });
    }
}

exports.create = function (context) {
    return new StorePostgreSQL(context);
};
