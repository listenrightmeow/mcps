import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import express from "express";

import { log } from "./helpers/log.js";
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

let transport: SSEServerTransport;

app.get("/sse", async (_req, res) => {
  log('Received connection', 'info');

  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);

  log('Connected - SSE', 'info');

  server.onclose = async () => {
    log('Disconnected - SSE', 'info');
    await server.close();
    process.exit(0);
  };
});

app.post("/message", async (req, res) => {
  log('Received message', 'info');

  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  log(`Server is running on port ${PORT}`, 'info');
});