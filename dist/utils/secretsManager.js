"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsManagerCache = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const logger_1 = require("./logger");
const logger = (0, logger_1.getLogger)(__filename);
class SecretsManagerCache {
    static instance;
    client;
    cache = new Map();
    constructor() { }
    static getInstance() {
        if (!SecretsManagerCache.instance) {
            SecretsManagerCache.instance = new SecretsManagerCache();
        }
        return SecretsManagerCache.instance;
    }
    getClient() {
        if (!this.client) {
            this.client = new client_secrets_manager_1.SecretsManagerClient({});
            logger.debug('SecretsManager client initialized');
        }
        return this.client;
    }
    async getSecret(secretId) {
        if (this.cache.has(secretId)) {
            return this.cache.get(secretId);
        }
        try {
            const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: secretId });
            const response = await this.getClient().send(command);
            if (!response.SecretString) {
                throw new Error(`Secret ${secretId} has no SecretString value`);
            }
            const secretValue = JSON.parse(response.SecretString);
            this.cache.set(secretId, secretValue);
            return secretValue;
        }
        catch (error) {
            logger.error(`Failed to fetch secret ${secretId}:`);
            throw error;
        }
    }
    async getDatabaseCredentials(secretId) {
        const secret = await this.getSecret(secretId);
        if (!secret.username || !secret.password) {
            throw new Error(`Secret ${secretId} does not contain required database credentials (username, password)`);
        }
        return secret;
    }
}
exports.SecretsManagerCache = SecretsManagerCache;
