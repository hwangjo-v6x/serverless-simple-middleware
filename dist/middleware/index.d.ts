export declare const middleware: {
    build: <Aux extends import("./base").HandlerAuxBase>(plugins: Array<import("./base").HandlerPluginBase<any>>) => (handler: import("./base").Handler<Aux>) => (event: any, context: any, callback: any) => void;
    aws: (options?: import("./aws").AWSPluginOptions) => import("./aws").AWSPlugin;
    trace: (options: import("./trace").TracerPluginOptions) => import("./trace").TracerPlugin;
    logger: (options: import("./logger").LoggerPluginOptions) => import("./logger").LoggerPlugin;
    mysql: (options: import("./mysql").MySQLPluginOptions) => import("./mysql").MySQLPlugin<unknown>;
};
export * from './aws';
export * from './base';
export * from './database/index';
export * from './logger';
export * from './mysql';
export * from './trace';
