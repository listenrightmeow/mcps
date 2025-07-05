export type HelloWorldArgs = {
    name?: string;
};

export const TOOL_NAME = 'hello-world';

// Tool definition
export const tools = {
    'hello-world': {
        name: 'hello-world',
        description: 'Generate a simple hello world message',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the person to greet (optional)',
                },
            },
            required: [],
        },
    },
};

const createHelloWorld = (args: HelloWorldArgs) => {
    const name = args.name || 'World';
    
    return {
        content: [
            {
                type: "text",
                text: `Hello, ${name}! This is a simple hello world message from the MCP server.`,
            },
        ],
    };
};

export const toolHandlers = {
    "hello-world": createHelloWorld,
};
