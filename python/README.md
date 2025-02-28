# Suada MCP Server (Python)

A compliant Model Context Protocol (MCP) server implementation for Suada, allowing language models to leverage Suada's data platform capabilities through standardized protocol interaction.

## Features

- **Standards Compliant**: Follows the official Model Context Protocol specification.
- **Business Analysis Tool**: Provides business insights, metrics, recommendations, and risk assessments through Suada's AI.
- **Data Retrieval Tool**: Access structured data from connected data sources in Suada.
- **Secure Auth**: API key based authentication with environment variable support.
- **Robust Logging**: Comprehensive logging for debugging and audit trails.

## Installation

### From Source

```bash
# Clone the repository (if you haven't already)
git clone <repository-url>
cd <repository-dir>/mcp/python

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

Get business insights and analysis from Suada AI.

**Parameters:**
- `query` (string, required): The business question to analyze
- `externalUserIdentifier` (string, required): User identifier for tracking and personalization
- `context` (object, optional): Additional context for the query

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
- `externalUserIdentifier` (string, required): User identifier for tracking and personalization

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