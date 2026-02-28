import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';

export class KeystoneRedact implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Keystone Redact',
        name: 'keystoneRedact',
        icon: 'file:keystone.svg',
        group: ['transform'],
        version: 1,
        subtitle: 'Redact PII from text',
        description: 'Detect and redact personally identifiable information (PII) from text before sending to LLMs',
        defaults: {
            name: 'Keystone Redact',
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
                displayName: 'Text',
                name: 'text',
                type: 'string',
                typeOptions: {
                    rows: 5,
                },
                default: '',
                placeholder: 'Text to redact PII from...',
                description: 'The text that will be scanned for PII and redacted',
                required: true,
            },
            {
                displayName: 'Task ID',
                name: 'taskId',
                type: 'string',
                default: '',
                placeholder: 'Optional task identifier',
                description: 'Optional identifier for audit purposes',
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
                const text = this.getNodeParameter('text', i) as string;
                const taskId = this.getNodeParameter('taskId', i, '') as string;

                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: `${serverUrl}/api/v1/redact`,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': credentials.apiKey as string,
                    },
                    body: {
                        text,
                        task_id: taskId,
                    },
                    json: true,
                });

                returnData.push({
                    json: {
                        redacted_text: response.redacted_text,
                        vault_token: response.vault_token,
                        entities_redacted: response.entities_redacted,
                        entities_warned: response.entities_warned,
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
                    description: 'Failed to redact text with Keystone',
                });
            }
        }

        return [returnData];
    }
}
