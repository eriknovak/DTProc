// interfaces
import * as qtopology from "qtopology";
import * as Interfaces from "../Interfaces";
import PostgreSQL from "./postgresql";


export default class PostgresRecords {

    private _data: any[];
    private _pg: PostgreSQL;
    private _sqlStatement: string;
    private _timeInterval: number;
    private _interval: NodeJS.Timeout;

    constructor(config: Interfaces.IPostgreSQLParams, sqlStatement: string, timeInterval: number) {
        // the record container
        this._data = [];
        // esablish connection with database
        this._pg = new PostgreSQL(config);
        // store the SQL statement for future use
        this._sqlStatement = sqlStatement;
        // store the interval value for continuous retrieval
        this._timeInterval = timeInterval;
        // the interval object
        this._interval = null;
    }

    enable() {
        // enable postgresql collection
        if (!this._interval) {
            this._interval = setInterval(() => {
                this._getMaterialMetadata().catch(console.log);
            }, this._timeInterval);
            this._getMaterialMetadata().catch(console.log);
        }
    }

    disable() {
        // disable postgresql collection
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

    next() {
        // get next data record
        if (this._data.length > 0) {
            const record = this._data[0];
            this._data = this._data.splice(1);
            return record;
        } else {
            return null;
        }
    }

    stop(callback: qtopology.SimpleCallback) {
        // disable interval
        this.disable();
        // close pg connection
        this._pg.close().then(() => { callback(); });
    }

    async _getMaterialMetadata() {
        const records = await this._pg.execute(this._sqlStatement, []);
        records.forEach((record) => {
            this._data.push(record);
        });
    }
}