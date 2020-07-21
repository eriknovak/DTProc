// modules
import BasicSpout from "./basic-spout";
import PostgresRecords from "../../library/postgresql-records";

// periodically retrieves the records from the postgreql table
class PostgresqlSpout extends BasicSpout {

    private _generator: PostgresRecords;

    constructor() {
        super();
        this._name = null;
        this._context = null;
        this._prefix = "";
        this._generator = null;
    }

    async init(name: string, config: any, context: any) {
        this._name = name;
        this._context = context;
        this._prefix = `[PostgresqlSpout ${this._name}]`;
        this._generator = new PostgresRecords(
            config.pg,
            config.sql_statement,
            config.time_interval
        );
    }

    heartbeat() {
        // do something if needed
    }

    async shutdown() {
        // stop postgresql generator
        const promise = new Promise((resolve, reject) => {
            this._generator.stop(() => {
                return resolve();
            });
        });
        await promise;
    }

    run() {
        // enable postgresql generator
        this._generator.enable();
    }

    pause() {
        // disable postgresql generator
        this._generator.disable();
    }

    async next() {
        const message = this._generator.next();
        // get the next message from the generator
        return { data: message };
    }
}

// create a new instance of the spout
const create = () => new PostgresqlSpout();

export { create };