"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = exports.expressionBuilder = exports.SQLClient = void 0;
const kysely_1 = require("kysely");
const mysql2_1 = require("mysql2");
class LazyConnectionPool {
    config;
    connection = null;
    constructor(config) {
        this.config = config;
    }
    getConnection = (callback) => {
        if (this.connection) {
            callback(null, this.connection);
            return;
        }
        const conn = (0, mysql2_1.createConnection)(this.config);
        conn.connect((err) => {
            if (err) {
                callback(err, {});
                return;
            }
            this.connection = this._addRelease(conn);
            callback(null, this.connection);
        });
    };
    end = (callback) => {
        if (this.connection) {
            this.connection.end((err) => {
                this.connection = null;
                callback(err);
            });
        }
        else {
            callback(null);
        }
    };
    destroy = () => {
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
    };
    _addRelease = (connection) => Object.assign(connection, {
        release: () => { },
    });
}
class SQLClient extends kysely_1.Kysely {
    pool;
    constructor(config) {
        const pool = new LazyConnectionPool(config);
        super({
            dialect: new kysely_1.MysqlDialect({
                pool,
            }),
            plugins: [
                new kysely_1.HandleEmptyInListsPlugin({
                    strategy: kysely_1.replaceWithNoncontingentExpression,
                }),
            ],
        });
        this.pool = pool;
    }
    clearConnection = () => new Promise((resolve) => {
        this.pool.end(() => resolve());
    });
    /**
     * Destroy the connection socket immediately. No further events or callbacks will be triggered.
     * This should be used only for special use cases!
     */
    destroyConnection = () => {
        this.pool.destroy();
    };
}
exports.SQLClient = SQLClient;
var kysely_2 = require("kysely");
Object.defineProperty(exports, "expressionBuilder", { enumerable: true, get: function () { return kysely_2.expressionBuilder; } });
Object.defineProperty(exports, "sql", { enumerable: true, get: function () { return kysely_2.sql; } });
