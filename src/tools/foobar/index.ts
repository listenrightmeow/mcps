export type FoobarArgs = {
    message?: string;
};

export const TOOL_NAME = 'foobar';

// Tool definition
export const tools = {
    'foobar': {
        name: 'foobar',
        description: 'A simple test tool that returns a foobar message',
        inputSchema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Optional message to include in the response',
                },
            },
            required: [],
        },
    },
};

const createFoobar = (args: FoobarArgs) => {
    const message = args.message || 'default';
    
    return {
        content: [
            {
                type: "text",
                text: `Foobar response! You sent: "${message}". Current time: ${new Date().toISOString()}`,
            },
        ],
    };
};

export const toolHandlers = {
    "foobar": createFoobar,
};
