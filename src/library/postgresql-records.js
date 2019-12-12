// internal modules
const PG = require("./postgresql");

// //////////////////////////////////////////////
// Class definition
// //////////////////////////////////////////////

class PostgresRecords {
    // TODO: add documentation
    constructor(config, sql_statement, time_interval_millis) {
        // the record container
        this._data = [];
        // esablish connection with database
        this._pg = PG(config);
        // store the SQL statement for future use
        this._sqlStatement = sql_statement;
        // store the interval value for continuous retrieval
        this._time_interval = time_interval_millis;
        // the interval object
        this._interval = null;
    }

    enable() {
        let self = this;
        if (!self._interval) {
            self._interval = setInterval(() => {
                self._getMaterialMetadata().catch(console.log);
            }, self._time_interval);
            self._getMaterialMetadata().catch(console.log);
        }
    }

    disable() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

    next() {
        if (this._data.length > 0) {
            let record = this._data[0];
            this._data = this._data.splice(1);
            return record;
        } else {
            return null;
        }
    }

    stop(callback) {
        // disable interval
        this.disable();
        // close pg connection
        this._pg.close(callback);
    }


    async _getMaterialMetadata() {
        let self = this;
        try {
            const records = await self._pg.execute(self._sqlStatement, []);
            records.forEach((record) => {
                self._data.push(record);
            });
        } catch (error) { }
    }
}

module.exports = PostgresRecords;
