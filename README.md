# MCP Sandbox

This is a sandbox for testing the ModelContextProtocol SDK. Add your MCP server to Claude Desktop to use it. I use [ASDF](https://asdf-vm.com) to manage Node, and this brings a couple of extra steps to the process.

## Installation

```bash
asdf reshim nodejs
npm install
```

### Claude

```json
{
  "mcpServers": {
    "smaaash": {
      "command": "node",
      "args": ["full/system/path/to/.dist/index.js"],
      "env": {
        "HOME": "/Users/listenrightmeow",
        "PATH": "/Users/listenrightmeow/.asdf/shims:/usr/bin:/usr/local/bin:/bin",
        "ASDF_DIR": "/opt/homebrew/opt/asdf/libexec",
        "ASDF_DATA_DIR": "/Users/listenrightmeow/.asdf",
        "ASDF_NODEJS_VERSION": "24.1.0",
        "ASDF_PATH": "/usr/local/opt/asdf"
      }
    }
  }
}
```

## Building

```bash
npm run build
```

## Running

```bash
npm run inspector
```