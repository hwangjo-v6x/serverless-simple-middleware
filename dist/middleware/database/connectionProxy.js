"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionProxy = void 0;
const rds_signer_1 = require("@aws-sdk/rds-signer");
const mysql2_1 = require("mysql2");
const utils_1 = require("../../utils");
const logger = (0, utils_1.getLogger)(__filename);
const mysqlClearPasswordPlugin = (token) => () => () => Buffer.from(`${token}\0`);
class ConnectionProxy {
    pluginConfig;
    signer;
    connection;
    initialized;
    dbName;
    constructor(config) {
        this.pluginConfig = config;
        if (config.schema && config.schema.database) {
            this.dbName = config.config.database;
            config.config.database = undefined;
        }
        this.signer = new rds_signer_1.Signer({
            hostname: config.config.host,
            port: config.config.port,
            username: config.config.user,
        });
    }
    query = (sql, params) => new Promise(async (resolve, reject) => {
        const connection = await this.prepareConnection();
        await this.tryToInitializeSchema(false);
        if (process.env.NODE_ENV !== 'test') {
            logger.silly(`Execute query[${sql}] with params[${params}]`);
        }
        connection.query(sql, params, (err, result, _fields) => {
            if (err) {
                logger.error(`error occurred in database query=${sql}, error=${err}`);
                reject(err);
            }
            else {
                resolve(result);
                if (process.env.NODE_ENV !== 'test') {
                    logger.silly(`DB result is ${JSON.stringify(result)}`);
                }
            }
        });
    });
    fetch = (sql, params) => this.query(sql, params).then((res) => res || []);
    fetchOne = (sql, params, defaultValue) => this.fetch(sql, params).then((res) => {
        if (res === undefined || res[0] === undefined) {
            // Makes it as non-null result.
            return defaultValue || {};
        }
        return res[0];
    });
    beginTransaction = () => new Promise(async (resolve, reject) => {
        const connection = await this.prepareConnection();
        await this.tryToInitializeSchema(false);
        connection.beginTransaction((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
    commit = () => new Promise(async (resolve, reject) => {
        const connection = await this.prepareConnection();
        await this.tryToInitializeSchema(false);
        connection.commit((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
    rollback = () => new Promise(async (resolve, reject) => {
        const connection = await this.prepareConnection();
        await this.tryToInitializeSchema(false);
        connection.rollback((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
    clearConnection = () => {
        if (this.connection) {
            this.connection.end();
            this.connection = undefined;
            logger.verbose('Connection is end');
        }
    };
    /**
     * Destroy the connection socket immediately. No further events or callbacks will be triggered.
     * This should be used only for special use cases!
     */
    destroyConnection = () => {
        if (this.connection) {
            this.connection.destroy();
            this.connection = undefined;
            logger.verbose('Connection is destroyed');
        }
    };
    onPluginCreated = async () => this.tryToInitializeSchema(true);
    prepareConnection = async () => {
        if (this.connection) {
            return this.connection;
        }
        const token = await this.signer.getAuthToken();
        this.connection = (0, mysql2_1.createConnection)({
            ...this.pluginConfig.config,
            password: token,
            ssl: { rejectUnauthorized: true },
            authPlugins: {
                mysql_clear_password: mysqlClearPasswordPlugin(token),
            },
        });
        this.connection.connect();
        return this.connection;
    };
    changeDatabase = (dbName) => new Promise((resolve, reject) => this.prepareConnection().then((connection) => connection.changeUser({
        database: dbName,
    }, (err) => (err ? reject(err) : resolve(undefined)))));
    tryToInitializeSchema = async (initial) => {
        const { eager = false, ignoreError = false, database = '', tables = {}, } = this.pluginConfig.schema || {};
        if (initial && !eager) {
            return;
        }
        // This method can be called twice when eager option is on,
        // so this flag should be set and checked at first.
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        try {
            if (database) {
                logger.debug(`Prepare a database[${this.dbName}]`);
                logger.stupid(this.dbName, database);
                const result = await this.query(database);
                logger.debug(`Database[${this.dbName}] is initialized: ${JSON.stringify(result)}`);
            }
            if (this.dbName) {
                await this.changeDatabase(this.dbName);
                logger.verbose(`Database[${this.dbName}] is connected.`);
            }
            for (const [name, query] of Object.entries(tables)) {
                logger.debug(`Prepare a table[${name}]`);
                logger.stupid(name, query);
                const result = await this.query(query);
                logger.debug(`Table[${name}] is initialized: ${JSON.stringify(result)}`);
            }
            logger.verbose(`Database schema is initialized.`);
        }
        catch (error) {
            logger.warn(error);
            if (!ignoreError) {
                throw error;
            }
        }
    };
}
exports.ConnectionProxy = ConnectionProxy;
