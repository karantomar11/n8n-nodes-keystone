import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class KeystoneApi implements ICredentialType {
    name = 'keystoneApi';
    displayName = 'Keystone API';
    documentationUrl = 'https://docs.keystone.dev/n8n';
    properties: INodeProperties[] = [
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

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'X-API-Key': '={{$credentials.apiKey}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.serverUrl}}',
            url: '/api/v1/health',
        },
    };

}
