# QTopology Spouts

This folder contains custom spouts used for acquiring documents from different sources.
The standard qtopology spouts can be found [here](https://qminer.github.io/qtopology/std-nodes.html).

## Kafka Spout
The [kafka](./kafka_spout.ts) spout connects to a given [Apache Kafka](https://kafka.apache.org/)
service and listens to a given topic. A kafka group ID can be assigned to the spout to have
multiple listeners on a given topic. It requires the following parameters.

| Parameter        | Description                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------|
| kafka            | the kafka connection configuration                                                                                   |
| kafka.host       | the host address of the kafka service                                                                                |
| kafka.topic      | the name of the kafka topic the spout will listen                                                                    |
| kafka.group_id   | the kafka group id                                                                                                   |
| kafka.high_water | (optional) the maximum number of messages it can receive in the query before it pauses (default: `100`)              |
| kafka.low_water  | (optional) the minimum number of messages in can have before it starts again the message receiving (default: `10`)   |

The schema for this spout in the ontology is:

```json
{
    "name": "kafka-spout-name",
    "type": "inproc",
    "working_dir": "./spouts",
    "cmd": "kafka-spout.js",
    "init": {
        "kafka": {
            "host": "127.0.0.1:9092",
            "topic": "topic0",
            "group_id": "group0",
            "high_water": 100,
            "low_water": 10
        }
    }
}
```

## PostgreSQL Spout
The [postgresql](./postgresql_spout.ts) spout connects to a given [PostgreSQL service](https://www.postgresql.org/)
service and periodically retrieves the records form the specified database. Here, the user needs
to be careful to assign some constraint to the SQL statement that will handle retrieving unique
records (not sending the same records). It requires the following parameters.

| Parameter                      | Description                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------|
| pg                             | the postgresql connection configuration                                                                              |
| pg.user                        | the user name that will access the PostgreSQL service                                                                |
| pg.database                    | the database name                                                                                                    |
| pg.password                    | the password used to access the PostgreSQL service                                                                   |
| pg.host                        | the host address of the PostgreSQL service                                                                           |
| pg.port                        | the port number of the PostgreSQL service                                                                            |
| sql_statement                  | the SQL statement used to retrieve and forward the PostgresQL records                                                |
| time_interval_millis           | the time interval in milliseconds; describes how frequently the spout should retrieve the PostgreSQL record          |


The schema for this spout in the ontology is (be sure to move the vulnerable information, i.e. password,
to the `.env` file in the [config](../../config) folder):

```json
{
    "name": "postgresql-spout-name",
    "type": "inproc",
    "working_dir": "./spouts",
    "cmd": "postgresql-spout.js",
    "init": {
        "pg": {
            "user": "username",
            "database": "test",
            "password": "secret-password",
            "host": "127.0.0.1",
            "port": "5432",
        },
        "sql_statement": "SELECT * FROM test LIMIT 10;",
        "time_interval_millis": 60000
    }
}
```