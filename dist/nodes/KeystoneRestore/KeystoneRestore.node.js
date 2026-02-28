"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeystoneRestore = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class KeystoneRestore {
    constructor() {
        this.description = {
            displayName: 'Keystone Restore',
            name: 'keystoneRestore',
            icon: 'file:keystone.svg',
            group: ['transform'],
            version: 1,
            subtitle: 'Restore redacted text',
            description: 'Restore original PII values after LLM processing using the vault token',
            defaults: {
                name: 'Keystone Restore',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'keystoneApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Redacted Text',
                    name: 'redactedText',
                    type: 'string',
                    typeOptions: {
                        rows: 5,
                    },
                    default: '',
                    placeholder: 'Text with [PERSON_A] placeholders...',
                    description: 'The redacted text containing placeholder tokens',
                    required: true,
                },
                {
                    displayName: 'Vault Token',
                    name: 'vaultToken',
                    type: 'string',
                    typeOptions: {
                        password: true,
                    },
                    default: '',
                    placeholder: 'Encrypted vault token from redaction step',
                    description: 'The vault token returned by Keystone Redact node',
                    required: true,
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('keystoneApi');
        const serverUrl = credentials.serverUrl.replace(/\/$/, '');
        for (let i = 0; i < items.length; i++) {
            try {
                const redactedText = this.getNodeParameter('redactedText', i);
                const vaultToken = this.getNodeParameter('vaultToken', i);
                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: `${serverUrl}/api/v1/restore`,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': credentials.apiKey,
                    },
                    body: {
                        redacted_text: redactedText,
                        vault_token: vaultToken,
                    },
                    json: true,
                });
                returnData.push({
                    json: {
                        restored_text: response.restored_text,
                        entities_restored: response.entities_restored,
                        status: response.status,
                    },
                    pairedItem: { item: i },
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: errorMessage,
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), errorMessage, {
                    itemIndex: i,
                    description: 'Failed to restore text with Keystone',
                });
            }
        }
        return [returnData];
    }
}
exports.KeystoneRestore = KeystoneRestore;
//# sourceMappingURL=KeystoneRestore.node.js.map