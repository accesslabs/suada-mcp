# Suada MCP Server (TypeScript)

A compliant Model Context Protocol (MCP) server implementation for Suada's Integrated Reasoning Framework, enabling AI models to build custom data pipelines and access intelligent reasoning capabilities through the Claude App or any MCP client.

## Suada: Build Custom Data Pipelines for Agents

Suada is an Integrated Reasoning Framework that enables AI agents to:

- **Retrieve and reason over custom live data feeds**
- **Access cross-dimensional intelligence from multiple sources**
- **Generate business insights, metrics, and recommendations**
- **Rapidly process and analyze structured data**

This MCP server implementation allows you to connect Claude and other LLMs to Suada's capabilities with minimal setup.

## Getting Started

To use Suada's MCP implementation with Claude or other LLMs, follow these steps:

### Step 1: Sign Up for Suada

1. Visit [https://suada.ai](https://suada.ai) and sign up for an account
2. Verify your email and log in to access your dashboard

### Step 2: Connect Integrations and Generate API Key

1. From your Suada dashboard, navigate to the Integrations section
2. Follow the guided setup to connect your data sources (databases, BI tools, etc.)
3. Go to the API section in your dashboard settings
4. Generate a new API key and store it securely - you'll need this for the MCP server

### Step 3: Set Up the MCP Server

1. Install the MCP server using the instructions below
2. Configure the server with your Suada API key
3. Start the server to make Suada's capabilities available to Claude and other models

## Features

- **Standards Compliant**: Follows the official Model Context Protocol specification.
- **Business Analysis Tool**: Provides business insights, metrics, recommendations, and risk assessments through Suada's AI.
- **Data Retrieval Tool**: Access structured data from connected data sources in Suada.
- **Direct Claude Integration**: Works directly in the Claude App without additional setup.
- **Secure Auth**: API key based authentication with environment variable support.
- **Robust Logging**: Comprehensive logging for debugging and audit trails.

## Installation

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/accesslabs/suada-mcp
cd suada-mcp/mcp/typescript

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Configuration

Create a `.env` file in the typescript directory with your Suada API key:

```
SUADA_API_KEY=your_api_key_here
```

Alternatively, you can provide the API key as a command-line argument when starting the server.

## Usage

### Starting the Server

```bash
# Using npm script
npm start

# Or with API key as command-line argument
node dist/suada-server.js --api-key your_api_key_here
```

### Using with MCP Client

This server implements the standard Model Context Protocol, making it compatible with any MCP client implementation, including the official `@modelcontextprotocol/sdk` client.

Example client usage:

```typescript
import { McpClient } from '@modelcontextprotocol/sdk/client/mcp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Start the MCP server as a child process
const serverProcess = spawn('node', ['path/to/dist/suada-server.js']);

// Connect to the server via stdio
const transport = new StdioClientTransport(serverProcess);
const client = new McpClient(transport);

// Initialize connection
await client.initialize();

// Call the business analyst tool
const result = await client.executeTool('suada_business_analyst', {
  query: 'What were our top performing products last quarter?',
  externalUserIdentifier: 'user-123'
});

console.log(result);
```

## Registered Tools

### suada_business_analyst

Get business insights and analysis from Suada's Integrated Reasoning Framework.

**Parameters:**
- `query` (string, required): The business question to analyze
- `externalUserIdentifier` (string, optional): User identifier for tracking and personalization (required if passthroughMode is true)
- `passthroughMode` (boolean, optional): When true, requires external_user_identifier. Defaults to false.

**Returns:**
- `response` (string): The business analysis response
- `metrics` (object): Key metrics extracted from the analysis
- `insights` (array): List of key insights from the analysis
- `recommendations` (array): List of recommendations based on the analysis
- `risks` (array): List of potential risks identified in the analysis

### suada_data_retrieval

Retrieve specific data from a connected data source in Suada.

**Parameters:**
- `dataSource` (string, required): The name of the data source to query
- `query` (string, required): The query to execute against the data source
- `externalUserIdentifier` (string, optional): User identifier for tracking and personalization (required if passthroughMode is true)
- `passthroughMode` (boolean, optional): When true, requires external_user_identifier. Defaults to false.

**Returns:**
- `data` (string): The retrieved data
- `metadata` (object): Metadata about the query, including source and query text

## Development

```bash
# Run in development mode (with hot reloading)
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT 