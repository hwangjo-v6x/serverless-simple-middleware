import { Kysely } from 'kysely';
import { type ConnectionOptions } from 'mysql2';
export declare class SQLClient<T = unknown> extends Kysely<T> {
    private pool;
    constructor(config: ConnectionOptions);
    clearConnection: () => Promise<void>;
}
export { sql, type DeleteQueryBuilder, type ExpressionBuilder, type InsertQueryBuilder, type SelectQueryBuilder, type UpdateQueryBuilder, } from 'kysely';
