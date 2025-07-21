import { Kysely } from 'kysely';
import { type ConnectionOptions } from 'mysql2';
export declare class SQLClient<T = unknown> extends Kysely<T> {
    private pool;
    constructor(config: ConnectionOptions);
    clearConnection: () => Promise<void>;
}
export { expressionBuilder, sql, type CaseBuilder, type DeleteQueryBuilder, type DeleteResult, type Expression, type ExpressionBuilder, type InferResult, type Insertable, type InsertQueryBuilder, type InsertResult, type NotNull, type RawBuilder, type Selectable, type SelectQueryBuilder, type SqlBool, type Transaction, type Updateable, type UpdateQueryBuilder, type UpdateResult, } from 'kysely';
