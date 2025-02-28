# Suada MCP Server (Python)

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

### From Source

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/accesslabs/suada-mcp
cd suada-mcp/mcp/python

# Install the package in development mode
pip install -e .

# For development dependencies
pip install -e ".[dev]"
```

### Using pip

```bash
pip install suada-mcp-server
```

## Configuration

Create a `.env` file in your working directory with your Suada API key:

```
SUADA_API_KEY=your_api_key_here
```

Alternatively, you can provide the API key as a command-line argument when starting the server.

## Usage

### Starting the Server

```bash
# Using the installed script
suada-mcp-server

# Or with API key as command-line argument
suada-mcp-server --api-key your_api_key_here

# Or run the module directly
python -m suada_mcp.server --api-key your_api_key_here
```

### Using with MCP Client

This server implements the standard Model Context Protocol, making it compatible with any MCP client implementation, including the official Python MCP client.

Example client usage:

```python
import subprocess
from modelcontextprotocol.client import McpClient
from modelcontextprotocol.client.stdio import StdioClientTransport

# Start the MCP server as a subprocess
server_process = subprocess.Popen(
    ["suada-mcp-server", "--api-key", "your_api_key_here"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# Connect to the server via stdio
transport = StdioClientTransport(server_process)
client = McpClient(transport)

# Initialize connection
client.initialize()

# Call the business analyst tool
result = client.execute_tool(
    "suada_business_analyst",
    {
        "query": "What were our top performing products last quarter?",
        "externalUserIdentifier": "user-123"
    }
)

print(result)
```

## Registered Tools

### suada_business_analyst

Get business insights and analysis from Suada's Integrated Reasoning Framework.

**Parameters:**
- `query` (string, required): The business question to analyze
- `externalUserIdentifier` (string, optional): User identifier for tracking and personalization (required if passthrough_mode is True)
- `passthrough_mode` (boolean, optional): When True, requires external_user_identifier. Defaults to False.

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
- `externalUserIdentifier` (string, optional): User identifier for tracking and personalization (required if passthrough_mode is True)
- `passthrough_mode` (boolean, optional): When True, requires external_user_identifier. Defaults to False.

**Returns:**
- `data` (string): The retrieved data
- `metadata` (object): Metadata about the query, including source and query text

## Development

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black .
isort .

# Run linting
ruff check .

# Run type checking
mypy suada_mcp
```

## Project Structure

```
suada_mcp/
├── __init__.py
├── server.py      # Main MCP server implementation
├── tools/         # Tool implementations
│   ├── __init__.py
│   ├── business_analyst.py
│   └── data_retrieval.py
└── utils/         # Utility functions
    ├── __init__.py
    └── logging.py
```

## License

MIT 