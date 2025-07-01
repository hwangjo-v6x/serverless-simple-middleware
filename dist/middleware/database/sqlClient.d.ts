import { Kysely } from 'kysely';
import { type ConnectionOptions } from 'mysql2';
export declare class SQLClient<T = unknown> extends Kysely<T> {
    private pool;
    constructor(config: ConnectionOptions);
    clearConnection: () => Promise<void>;
}
export { expressionBuilder, sql, type DeleteQueryBuilder, type Expression, type ExpressionBuilder, type InsertQueryBuilder, type RawBuilder, type SelectQueryBuilder, type SqlBool, type UpdateQueryBuilder, } from 'kysely';
