# Model Context Protocol (MCP) for Suada

This directory contains implementation of Suada's Model Context Protocol (MCP) server, which allows language models like Claude to access Suada's business insights and data retrieval capabilities directly through the MCP interface.

## What is MCP?

Model Context Protocol (MCP) provides a standard way for language models to interact with external tools and data sources. It enables models to:

1. Discover available tools through a standardized API
2. Access tools to retrieve and manipulate data
3. Execute business logic on behalf of users

## Implementations

This repository includes MCP server implementations in two languages:

### Python Implementation

Located in the `python/` directory. Uses the official `modelcontextprotocol` SDK.

Key features:
- Provides Suada's business analyst capabilities as an MCP tool
- Offers data retrieval from connected data sources
- Simple to integrate with any MCP-compatible model

### TypeScript Implementation

Located in the `typescript/` directory. Uses the official `@modelcontextprotocol/sdk` package.

Key features:
- Implements the same functionality as the Python version, but for Node.js environments
- TypeScript types for better development experience
- Compatible with Node.js runtime environments

## Claude Integration

Both implementations have been updated to be compatible with Claude in the Claude App:

- Removed `external_user_identifier` requirement, which allows tools to work directly in the Claude app without needing to provide user identifiers
- Removed `context` parameter for simpler integration

## Installation

### Python

```bash
cd python
pip install -r requirements.txt
```

### TypeScript

```bash
cd typescript
npm install
```

## Usage

### Running the Python MCP Server

```bash
cd python
export SUADA_API_KEY=your_api_key_here
python suada_server.py
```

Or with the API key as an argument:

```bash
python suada_server.py --api-key your_api_key_here
```

### Running the TypeScript MCP Server

```bash
cd typescript
export SUADA_API_KEY=your_api_key_here
npm start
```

Or with the API key as an argument:

```bash
npm start -- --api-key your_api_key_here
```

## LangChain Integration

Both implementations can be easily wrapped in LangChain tools for integration with agents. Examples are provided in the respective implementation directories.

## License

MIT

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.ai/)
- [Suada Documentation](https://docs.suada.com/)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol/mcp) 