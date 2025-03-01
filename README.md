# Suada Model Context Protocol (MCP)

This repository contains a Model Context Protocol (MCP) implementation for Suada, enabling language models to access Suada's Integrated Reasoning Framework through standardized interfaces.

## Suada: Build Custom Data Pipelines for Agents

Suada is an Integrated Reasoning Framework that helps you build custom data pipelines for AI agents. With Suada, you can:

- **Retrieve and reason over custom live data feeds**
- **Integrate business intelligence with your agents**
- **Access cross-dimensional intelligence**
- **Ship agents that think in minutes**

This MCP implementation provides a bridge between AI models (like Claude) and Suada's powerful data processing and reasoning capabilities.

We provide integrations to the following platforms, with more to come in the future:

- Slack
- Notion
- Google Analytics
- Hubspot
- Linear
- Zoho
- Jira

## What is MCP?

Model Context Protocol (MCP) provides a standard way for language models to interact with external tools and data sources. This implementation allows Claude and other MCP-compatible models to:

1. Access Suada's business intelligence capabilities directly through the Claude App
2. Retrieve and analyze data from your connected sources
3. Generate insights, metrics, recommendations, and risk assessments

## Getting Started

To use Suada's MCP implementation with Claude or other LLMs, follow these steps:

### Step 1: Sign Up for Suada

Go to [https://suada.ai](https://suada.ai) and sign up for an account. You'll need this to access Suada's Integrated Reasoning Framework.

### Step 2: Connect Integrations and Generate API Key

1. Log in to your Suada dashboard
2. Follow the instructions to connect your data integrations (databases, analytics platforms, etc.)
3. Navigate to the API section to generate your API key
4. Copy your API key - you'll need it to set up the MCP server

### Step 3: Download and Setup the MCP

Choose either the Python or TypeScript implementation (instructions below), configure it with your API key, and start the server to make Suada's capabilities available to Claude and other models.

## Implementations

This repository includes MCP server implementations in two languages:

### Python Implementation

Located in the `python/` directory. Uses the official `modelcontextprotocol` SDK.

Key features:
- Business analyst tool for generating insights and metrics
- Data retrieval from connected sources
- Compatible with Claude in the Claude App
- Easy integration with any MCP-compatible model

### TypeScript Implementation

Located in the `typescript/` directory. Uses the official `@modelcontextprotocol/sdk` package.

Key features:
- Implements the same functionality as the Python version for Node.js environments
- TypeScript types for better development experience
- Compatible with Node.js runtime environments

## Claude Integration

Both implementations are compatible with Claude in the Claude App, allowing direct access to Suada's capabilities without additional setup. You can also use these implementations with any MCP client.

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

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Suada Documentation](https://docs.suada.ai/)
- [MCP GitHub Organization](https://github.com/modelcontextprotocol/) 
