import type { ConnectionConfig } from 'mysql';
import type { PoolOptions } from 'mysql2';
import { HandlerAuxBase, HandlerPluginBase } from './base';
import { ConnectionProxy } from './database/connectionProxy';
import { SQLClient } from './database/sqlClient';
export interface MySQLPluginOptions {
    config: ConnectionConfig & PoolOptions;
    schema?: {
        eager?: boolean;
        ignoreError?: boolean;
        database?: string;
        tables?: {
            [tableName: string]: string;
        };
    };
}
export interface MySQLPluginAux<T = unknown> extends HandlerAuxBase {
    db: ConnectionProxy;
    database: SQLClient<T>;
}
export declare class MySQLPlugin<T = unknown> extends HandlerPluginBase<MySQLPluginAux<T>> {
    private proxy;
    private sqlClient;
    constructor(options: MySQLPluginOptions);
    create: () => Promise<{
        db: ConnectionProxy;
        database: SQLClient<T>;
    }>;
    end: () => void;
}
declare const build: (options: MySQLPluginOptions) => MySQLPlugin<unknown>;
export default build;
