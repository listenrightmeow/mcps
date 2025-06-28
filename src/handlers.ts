import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    GetPromptRequestSchema,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { 
    listing as helloListing, 
    resource as helloResource,
    HANDLER_URI as HELLO_URI 
} from "./handlers/hello/index.js";
import { 
    listing as greetingsListing, 
    resource as greetingsResource,
    HANDLER_REGEX as GREETINGS_REGEX,
} from "./handlers/greetings/index.js";
import { 
    log,
    logRequest
} from "./helpers/log.js";
import { 
    prompts as greetingsPrompts,
    promptHandlers as greetingsPromptHandlers,
    type GreetingPromptArgs,
} from "./prompts/greetings/index.js";
import {
    type CreateMessageArgs,
    tools,
    toolHandlers,
} from "./tools/greetings/index.js";

interface ResourceRequest {
    params: {
        uri: string;
    };
    headers?: Record<string, string>;
    method?: string;
}

export const setupHandlers = (server: Server) => {
    // List available resources when clients request them
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: [
            await helloListing()
        ]
    }));
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
        resourceTemplates: [
            await greetingsListing()
        ]
    }));
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: Object.values(tools)
    }));

    // Return resource content when clients request it
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const toolHandler = toolHandlers[name as keyof typeof toolHandlers];
        if (!toolHandler) {
            throw new Error('Tool not found');
        }
        return toolHandler(args as CreateMessageArgs);
    });
    server.setRequestHandler(ReadResourceRequestSchema, async (request): Promise<{ contents: { uri: string; text: string }[] }> => {
        let error;
        const uri = request.params!.uri;
        const resources = [
            [greetingsResource, GREETINGS_REGEX]
        ] as [typeof greetingsResource, RegExp][];
    
        // Log the request for monitoring
        logRequest(
            request.method,
            request.params.uri,
            { handler: 'handlers' }
        );

        try {
            if ([HELLO_URI].includes(uri)) {
                const resourceHandlers: Record<string, (request: ResourceRequest) => Promise<{ contents: { uri: string; text: string }[] }>> = {
                    [HELLO_URI]: helloResource,
                }
    
                return await resourceHandlers[uri as keyof typeof resourceHandlers]!(request);
            }

            for (const [resource, regex] of resources) {
                const match = uri.match(regex);
                if (match) {
                    return await resource(request, match[1]!);
                }
            }
        } catch (err) {
            error = new Error('Resource Handler failed');
            log('Resource Handler failed', 'warn', { 
                handler: 'handlers',
                uri,
                error: (err as Error).message
            });
            
            throw error;
        }

        error = new Error('Resource not found');
        log('Resource not found', 'warn', { 
            handler: 'handlers',
            uri,
            error: error.message
        });
        throw error;
    });

    // List available prompts when clients request them
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
        prompts: Object.values(greetingsPrompts)
    }));

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const promptHandler = greetingsPromptHandlers[name as keyof typeof greetingsPromptHandlers];
        if (!promptHandler) {
            throw new Error('Prompt not found');
        }
        return promptHandler(args as unknown as GreetingPromptArgs);
    });
};
