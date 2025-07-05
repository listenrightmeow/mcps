import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import cors from "cors";

import packageJson from "../package.json" with { type: "json" };
import { setupHandlers } from "./handlers.js";
import { log } from "./helpers/log.js";

const app = express();
const PORT = process.env['PORT'] || 3001;

log(process.env['ENVIRONMENT']!, 'info');

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

const server = new Server(
    {
        name: packageJson.name,
        version: packageJson.version,
    },
    {
        capabilities: {
            tools: {},
            resources: {},
            prompts: {},
        }
    }
);

// Setup handlers for tools, resources, and prompts
setupHandlers(server);

// Create StreamableHTTPServerTransport in stateless mode for OpenAI compatibility
const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode - no session management
    enableJsonResponse: true, // Enable JSON responses for OpenAI compatibility
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    log('Shutting down MCP server.', 'info');
    await server.close();
    process.exit(0);
});

// Handle all MCP requests through the streamable transport
app.use('/mcp', async (req, res) => {
    try {
        log(`Received ${req.method} request to ${req.url}`, 'info');
        log(`Request headers: ${JSON.stringify(req.headers)}`, 'info');
        log(`Request body: ${JSON.stringify(req.body)}`, 'info');
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        log(`Error handling request: ${(error as Error).message}`, 'error');
        log(`Error stack: ${(error as Error).stack}`, 'error');
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
        }
    }
});

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint with information
app.get('/', (_req, res) => {
    res.json({
        name: packageJson.name,
        version: packageJson.version,
        description: 'MCP Server with Streamable HTTP Transport',
        endpoints: {
            mcp: '/mcp',
            health: '/health'
        },
        tools: [
            {
                name: 'foobar',
                description: 'A simple test tool that returns a foobar message'
            }
        ]
    });
});

async function main() {
    try {
        // Connect the server to the transport
        await server.connect(transport as any);
        
        // Start the HTTP server and return a promise that resolves when it's listening
        await new Promise<void>((resolve, reject) => {
            const httpServer = app.listen(PORT, (err?: Error) => {
                if (err) {
                    reject(err);
                    return;
                }
                log(`Streamable HTTP MCP Server running on port ${PORT}`, 'info');
                log(`MCP endpoint: http://localhost:${PORT}/mcp`, 'info');
                log(`Health check: http://localhost:${PORT}/health`, 'info');
                resolve();
            });
            
            // Handle graceful shutdown
            process.on('SIGTERM', async () => {
                log('Received SIGTERM, shutting down gracefully', 'info');
                httpServer.close(() => {
                    log('HTTP server closed', 'info');
                    process.exit(0);
                });
            });
        });
        
        // Keep the process alive with an interval
        const keepAlive = setInterval(() => {
            // This empty interval keeps the event loop alive
        }, 1000);
        
        // Clean up interval on shutdown
        process.on('SIGINT', () => {
            clearInterval(keepAlive);
        });
        
    } catch (error) {
        log(`Error starting server: ${(error as Error).message}`, 'error');
        process.exit(1);
    }
}

main();
