import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import packageJson from "../package.json" with { type: "json" };
import { setupHandlers } from "./handlers.js";
import { log } from "./helpers/log.js";

let transport: StdioServerTransport;

log(process.env['ENVIRONMENT']!,'info');

const server = new Server(
    {
        name: packageJson.name,
        version: packageJson.version,
    },
    {
        capabilities: {
            // prompts: {},
            resources: {},
            tools: {},
        }
    }
);

process.on('SIGINT', () => {
    log('Shutting down MCP server.', 'error');
    process.exit(0);
});

async function main() {
    try {
        setupHandlers(server);
        transport = new StdioServerTransport();
        await server.connect(transport);
        log('StdioServer running.');
    } catch (error) {
        log(error as string, 'error');
        process.exit(1);
    }
}

main();