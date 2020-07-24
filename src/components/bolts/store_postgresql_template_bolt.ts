/** ******************************************************************
 * This component receives the verified OER material object and
 * stores it into postgresQL database.
 */

// interfaces
import * as Interfaces from "../../Interfaces";


// modules
import BasicBolt from "./basic_bolt";
import PostgreSQL from "../../library/postgresql";


class StorePostgreSQLBolt extends BasicBolt {

    private _pg: PostgreSQL;
    private _documentErrorPath: string;

    constructor() {
        super();
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    async init(name: string, config: Interfaces.IStorePostgreSQLTemplateConfig, context: any) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[StorePostgreSQLBolt ${this._name}]`;

        // create the postgres connection
        this._pg = new PostgreSQL(config.pg);
        // the path to where to store the error
        this._documentErrorPath = config.document_error_path || "error";
    }

    heartbeat() {
        // do something if needed
    }

    async shutdown() {
        // close connection to postgres database
        await this._pg.close();
    }

    async receive(message: any, stream_id: string) {
        // get sent values
        const {
            // TODO: extract fields of the message
        } = message;

        try {
            // TODO: store the objects in the database
            // await this._pg.upsert(/* object, id, table_name */ );
        } catch (error) {
            // error handling
            const errorMessage = `${this._prefix} Not able to store the message attributes: ${error.message}`;
            this.set(message, this._documentErrorPath, errorMessage);
            // TODO: finalize the error scenario
        }
    }
}

// create a new instance of the bolt
const create = () => new StorePostgreSQLBolt();

export { create };
