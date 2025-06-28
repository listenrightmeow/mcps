import { log } from '../../helpers/log.js';

// Constants
const HANDLER_NAME = 'greetings';
export const HANDLER_REGEX = /^greetings:\/\/(.+)$/;
const HANDLER_URI = 'greetings://{name}';

interface ResourceRequest {
    params: {
        uri: string;
    };
    headers?: Record<string, string>;
    method?: string;
}

interface ResourceTemplate {
    uriTemplate: string;
    name: string;
    description: string;
    mimeType: string;
}

/**
 * Lists all available greeting resource templates
 * @returns {Promise<ResourceTemplate>} List of available greeting templates
 */
export const listing = async (): Promise<ResourceTemplate> => {
    log('Listing greeting templates', 'debug', { handler: HANDLER_NAME });
    
    return {
        uriTemplate: HANDLER_URI,
        name: 'Personal Greeting',
        description: 'A personalized greeting message',
        mimeType: 'text/plain',
    };
};

/**
 * Generates a personalized greeting
 * @param {string} name - The name to include in the greeting
 * @returns {string} A personalized greeting message
 */
const generateGreeting = (name: string): string => {
    const hour = new Date().getHours();
    let timeOfDay = 'day';
    
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';
    
    return `Good ${timeOfDay}, ${name || 'there'}!`;
};

/**
 * Handles the greeting resource request
 * @param {object} params - Request parameters
 * @param {string} params.name - Name to greet
 * @returns {Promise<{ contents: Array<{ uri: string; text: string }> }>} The greeting message
 */
export const resource = async (request: ResourceRequest, name: string): Promise<{ contents: { uri: string; text: string }[] }> => {
    return {
        contents: [
            {
                uri: request.params.uri,
                text: generateGreeting(name)
            }
        ]
    };
};