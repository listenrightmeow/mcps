import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import express from "express";
import { randomUUID } from 'node:crypto';

import { log } from "./helpers/log.js";
import { setupHandlers } from "./handlers.js";
import packageJson from "../package.json" with { type: "json" };

const app = express();
const PORT = process.env['PORT'] || 3001;

log(process.env['ENVIRONMENT']!,'info');

const server = new Server(
    {
        name: packageJson.name,
        version: packageJson.version,
    },
    {
        capabilities: {
            prompts: {},
            resources: {},
            tools: {},
        }
    }
);

process.on('SIGINT', () => {
    log('Shutting down MCP server.', 'error');
    process.exit(0);
});

// Create a transport with a required session ID
const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID()
}) as any;

// Handle MCP requests
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
app.use("/mcp", express.json(), (req: express.Request, res: express.Response) => {
    log(`Received ${req.method} request to ${req.path}`, 'info');

    const sid = req.headers['x-session-id'];

    transport.onclose = () => {
        log(`Session ${sid} closed`, 'info');

        if (sid && transports[sid as string]) {
            delete transports[sid as string];
        }
    };
    
    transport.handleRequest(
        Object.assign(req, { auth: req.headers.authorization }),
        res,
        req.body
    ).catch((error: Error) => {
        log(`Error handling request: ${error.message}`, 'error');
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

// Connect the transport to the server
server.connect(transport as any)
    .then(() => log('Server connected to transport', 'info'))
    .catch((error: Error) => {
        log(`Failed to connect transport: ${error.message}`, 'error');
        process.exit(1);
    });

server.onclose = async () => {
    log('Server closing', 'info');
    await server.close();
    process.exit(0);
};

async function main() {
    try {
        setupHandlers(server);
        
        app.listen(PORT, () => {
            log(`StreamableHttp Server is running on port ${PORT}`, 'info');
        });
    } catch (error) {
        log(error as string, 'error');
        process.exit(1);
    }
}

main();
