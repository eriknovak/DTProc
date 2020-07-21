/** **********************************************
 * Creates the postgresql database for testing
 * the postgresql related components.
 */

require("module-alias/register");

// ///////////////////////////////////////////////
// Modules and configurations
// ///////////////////////////////////////////////

// configuration data
const config = require("@config/config");

// postgresql connection to the database
const pg = require("@library/postgresql")(config.pg);

// ///////////////////////////////////////////////
// Script parameters
// ///////////////////////////////////////////////

// get schema
const schema = config.pg.schema;

// Statement for checking if the provided schema exists
const schemaExistsString = `
    SELECT exists(
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = '${schema}')
    AS schema_exists;
`;

// Statement for creating the provided schema
const createSchemaString = `CREATE schema ${schema};`;


// Statement for checking if the tables exist
const tablesExistString = `
    SELECT *
    FROM information_schema.tables
    WHERE table_schema = '${schema}'
`;

const dbCreates = {
    processing_queue:
    `CREATE TABLE ${schema}.processing_queue (
        id                  serial PRIMARY KEY,
        material_id         integer UNIQUE,
        title               varchar,
        language            char (2),
        start_process_date  timestamp with time zone DEFAULT (NOW() AT TIME ZONE 'utc'),
        end_process_date    timestamp with time zone,
        status              varchar
    );

    ALTER TABLE ${schema}.processing_queue
        OWNER TO ${config.pg.user};

    CREATE INDEX processing_queue_material_id
        ON ${schema}.processing_queue(material_id);
    `
};

// ///////////////////////////////////////////////
// Helper functions
// ///////////////////////////////////////////////


/**
 * @description Initializes the schema creation process.
 * @returns {Promise} A promise that will create the requested schema.
 */
async function prepareSchema() {
    // returns row containing boolean true if schema in config exists, false otherwise
    const result = await pg.execute(schemaExistsString, []);
    if (result[0].schema_exists) { return; }
    console.log(`Creating new schema=${schema.toUpperCase()}`);
    await pg.execute(createSchemaString, []);
}


/**
 * @describe Checks and creates non-existing database tables.
 * @returns {Promise} A promise that will check and create non-existing
 * database tables.
 */
async function prepareTables() {
    const result = await pg.execute(tablesExistString, []);

    // delete already existing tables from dbCreates object
    for (let i = 0; i < result.length; i++) {
        const tableName = result[i].table_name;
        delete dbCreates[tableName];
    }

    const tableNames = Object.keys(dbCreates);

    for (let tableName of tableNames) {
        const sqlStatement = dbCreates[tableName];
        await pg.execute(sqlStatement, []);
    }
} // prepareTables()


/**
 * Updates DB to version specified in config.json
 * To implement an update, add following block:
 * doUpdate(X, '<SQL STRING>');
 * X -> Update level ( 1 more than previous)
 * <SQL STRING> -> SQL statement for update.
 * For multiple statements, it's possible to separate them with semi-colon-';'
 *
 * @returns Version DB was updated to
 */


/**
 * @description Executes the whole database creation and update process.
 * @param {Function} [callback] - The function executed at the end of the process.
 */
async function startDBCreate() {
    await prepareSchema();
    await prepareTables();
    await pg.close();
}


// ///////////////////////////////////////////////
// Script export
// ///////////////////////////////////////////////

exports.startDBCreate = startDBCreate;
