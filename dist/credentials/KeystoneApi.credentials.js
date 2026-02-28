"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeystoneApi = void 0;
class KeystoneApi {
    constructor() {
        this.name = 'keystoneApi';
        this.displayName = 'Keystone API';
        this.documentationUrl = 'https://docs.keystone.dev/n8n';
        this.properties = [
            {
                displayName: 'Server URL',
                name: 'serverUrl',
                type: 'string',
                default: 'http://host.docker.internal:8000',
                placeholder: 'http://localhost:8000',
                description: 'The URL of the Keystone server',
                required: true,
            },
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                placeholder: 'ks_live_xxxxxxxxxxxx',
                description: 'Your Keystone API key from the dashboard',
                required: true,
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {},
        };
    }
}
exports.KeystoneApi = KeystoneApi;
//# sourceMappingURL=KeystoneApi.credentials.js.map