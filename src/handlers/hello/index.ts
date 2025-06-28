import { log } from '../../helpers/log.js';

const HANDLER_NAME = 'hello';
export const HANDLER_URI = 'hello://world';

interface Resource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}

interface ResourceRequest {
    params: {
        uri: string;
    };
    headers?: Record<string, string>;
    method?: string;
}

/**
 * Lists all available resources in the hello handler
 */
export const listing = async (): Promise<Resource> => {
    log('Listing available resources', 'debug', { handler: HANDLER_NAME });
    
    return {
        uri: HANDLER_URI,
        name: 'Hello World Message',
        description: 'A simple hello world message',
        mimeType: 'text/plain',
    };
};

/**
 * Retrieves a specific resource by URI
 */
export const resource = async (_request: ResourceRequest): Promise<{ contents: { uri: string; text: string }[] }> => {
    return {
        contents: [
            {
                uri: HANDLER_URI,
                text: 'Hello, World!'
            }
        ]
    }
};