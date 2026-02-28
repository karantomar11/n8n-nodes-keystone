import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';

export class KeystoneRestore implements INodeType {
    description: INodeTypeDescription = {
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

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const credentials = await this.getCredentials('keystoneApi');

        const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');

        for (let i = 0; i < items.length; i++) {
            try {
                const redactedText = this.getNodeParameter('redactedText', i) as string;
                const vaultToken = this.getNodeParameter('vaultToken', i) as string;

                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: `${serverUrl}/api/v1/restore`,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': credentials.apiKey as string,
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

            } catch (error) {
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
                throw new NodeOperationError(this.getNode(), errorMessage, {
                    itemIndex: i,
                    description: 'Failed to restore text with Keystone',
                });
            }
        }

        return [returnData];
    }
}
