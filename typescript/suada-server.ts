/**
 * Suada Model Context Protocol (MCP) Server
 * 
 * This module implements a compliant MCP server for Suada, allowing models
 * to retrieve and reason over custom data feeds through Suada's data pipelines.
 */

import { McpServer } from '@modelcontextprotocol/sdk/dist/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/dist/server/stdio.js';
import { ToolExecutionError } from '@modelcontextprotocol/sdk/dist/common/errors.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load the Suada SDK
import { Suada } from '@suada/node';

// Set up logging
const logFile = fs.createWriteStream('suada_mcp_server.log', { flags: 'a' });
const logger = {
    info: (message: string) => {
        const log = `INFO [${new Date().toISOString()}] ${message}`;
        console.log(log);
        logFile.write(log + '\n');
    },
    error: (message: string) => {
        const log = `ERROR [${new Date().toISOString()}] ${message}`;
        console.error(log);
        logFile.write(log + '\n');
    }
};

// Load environment variables
dotenv.config();

class SuadaMCPServer {
    private server: McpServer;
    private suada: Suada;

    /**
     * Initialize the Suada MCP server
     * 
     * @param apiKey - Suada API key
     * @param serverName - Name for the MCP server
     * @param serverVersion - Version for the MCP server
     */
    constructor(
        apiKey?: string,
        serverName: string = 'suada',
        serverVersion: string = '1.0.0'
    ) {
        // Validate API key
        this.validateApiKey(apiKey);

        // Initialize Suada client
        this.suada = new Suada({
            apiKey: apiKey || process.env.SUADA_API_KEY as string
        });

        // Initialize MCP server
        this.server = new McpServer({
            name: serverName,
            version: serverVersion
        });

        // Register tools
        this.registerTools();

        logger.info(`Initialized Suada MCP server '${serverName}' v${serverVersion}`);
    }

    /**
     * Validate that an API key is available
     */
    private validateApiKey(apiKey?: string): void {
        if (!apiKey && !process.env.SUADA_API_KEY) {
            throw new Error('Suada API key is required. Provide it as an argument or set SUADA_API_KEY environment variable.');
        }
    }

    /**
     * Register all Suada-related tools with the MCP server
     */
    private registerTools(): void {
        // Business Analyst Tool
        this.server.registerTool({
            name: 'suada_business_analyst',
            description: 'Get business insights and analysis from Suada AI. Input should be a specific business question.',
            execute: async (params: Record<string, any>) => {
                try {
                    const { query } = params;

                    logger.info(`Executing business analyst tool. Query: ${query}`);

                    // Call Suada API
                    const response = await this.suada.chat({
                        message: query
                    });

                    // Extract and return the results
                    const result = {
                        response: response.response,
                        metrics: response.metrics || {},
                        insights: response.insights || [],
                        recommendations: response.recommendations || [],
                        risks: response.risks || []
                    };

                    logger.info(`Business analyst tool execution successful`);
                    return result;

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.error(`Error executing business analyst tool: ${errorMessage}`);
                    throw new ToolExecutionError(`Failed to get business insights: ${errorMessage}`);
                }
            },
            paramSchema: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The business question to analyze'
                    }
                },
                required: ['query']
            },
            returnSchema: {
                type: 'object',
                properties: {
                    response: {
                        type: 'string',
                        description: 'The business analysis response'
                    },
                    metrics: {
                        type: 'object',
                        description: 'Key metrics extracted from the analysis'
                    },
                    insights: {
                        type: 'array',
                        description: 'List of key insights from the analysis',
                        items: { type: 'string' }
                    },
                    recommendations: {
                        type: 'array',
                        description: 'List of recommendations based on the analysis',
                        items: { type: 'string' }
                    },
                    risks: {
                        type: 'array',
                        description: 'List of potential risks identified in the analysis',
                        items: { type: 'string' }
                    }
                }
            }
        });

        // Data Retrieval Tool
        this.server.registerTool({
            name: 'suada_data_retrieval',
            description: 'Retrieve specific data from a connected data source in Suada.',
            execute: async (params: Record<string, any>) => {
                try {
                    const { dataSource, query } = params;

                    logger.info(`Executing data retrieval tool. Data source: ${dataSource}, Query: ${query}`);

                    // Call Suada API
                    const response = await this.suada.chat({
                        message: `Retrieve data from ${dataSource}: ${query}`
                    });

                    // Return the results
                    const result = {
                        data: response.response,
                        metadata: {
                            source: dataSource,
                            query
                        }
                    };

                    logger.info(`Data retrieval tool execution successful`);
                    return result;

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.error(`Error executing data retrieval tool: ${errorMessage}`);
                    throw new ToolExecutionError(`Failed to retrieve data: ${errorMessage}`);
                }
            },
            paramSchema: {
                type: 'object',
                properties: {
                    dataSource: {
                        type: 'string',
                        description: 'The name of the data source to query'
                    },
                    query: {
                        type: 'string',
                        description: 'The query to execute against the data source'
                    }
                },
                required: ['dataSource', 'query']
            }
        });
    }

    /**
     * Start the MCP server
     */
    async run(): Promise<void> {
        try {
            const transport = new StdioServerTransport();
            await this.server.run(transport);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error running MCP server: ${errorMessage}`);
            process.exit(1);
        }
    }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const apiKeyIndex = args.indexOf('--api-key');
        const apiKey = apiKeyIndex >= 0 && apiKeyIndex < args.length - 1 ? args[apiKeyIndex + 1] : undefined;

        // Create and run the server
        const server = new SuadaMCPServer(apiKey);
        await server.run();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error initializing server: ${errorMessage}`);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
} 