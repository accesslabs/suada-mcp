"use strict";
/**
 * Suada Model Context Protocol (MCP) Server
 *
 * This module implements a compliant MCP server for Suada, allowing models
 * to retrieve and reason over custom data feeds through Suada's data pipelines.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import from the modelcontextprotocol SDK package
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod"); // Add zod import for schema validation
// Import the actual Suada SDK
const sdk_1 = require("@suada/sdk");
// Set up logging
const logFile = fs_1.default.createWriteStream('suada_mcp_server.log', { flags: 'a' });
const logger = {
    info: (message) => {
        const log = `INFO [${new Date().toISOString()}] ${message}`;
        console.log(log);
        logFile.write(log + '\n');
    },
    error: (message) => {
        const log = `ERROR [${new Date().toISOString()}] ${message}`;
        console.error(log);
        logFile.write(log + '\n');
    }
};
// Load environment variables
dotenv_1.default.config();
class SuadaMCPServer {
    server; // Use any for McpServer type to avoid TS errors
    suada;
    defaultExternalUserIdentifier = 'mcp-user';
    /**
     * Initialize the Suada MCP server
     *
     * @param apiKey - Suada API key
     * @param serverName - Name for the MCP server
     * @param serverVersion - Version for the MCP server
     */
    constructor(apiKey, serverName = 'suada', serverVersion = '1.0.0') {
        // Validate API key
        this.validateApiKey(apiKey);
        // Initialize Suada client with configuration
        const config = {
            apiKey: apiKey || process.env.SUADA_API_KEY,
            baseUrl: process.env.SUADA_BASE_URL || 'https://suada.ai/api/public'
        };
        // Create the Suada client
        this.suada = new sdk_1.Suada(config);
        // Initialize MCP server
        this.server = new mcp_js_1.McpServer({
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
    validateApiKey(apiKey) {
        if (!apiKey && !process.env.SUADA_API_KEY) {
            throw new Error('Suada API key is required. Provide it as an argument or set SUADA_API_KEY environment variable.');
        }
    }
    /**
     * Register all Suada-related tools with the MCP server
     */
    registerTools() {
        // Business Analyst Tool
        this.server.tool('suada_business_analyst', {
            query: zod_1.z.string().describe('The business question to analyze'),
            externalUserIdentifier: zod_1.z.string().optional().describe('Optional user identifier for tracking and personalization')
        }, async ({ query, externalUserIdentifier = this.defaultExternalUserIdentifier }) => {
            try {
                logger.info(`Executing business analyst tool. Query: ${query}`);
                // Call Suada API
                const response = await this.suada.chat({
                    message: query,
                    externalUserIdentifier: externalUserIdentifier
                });
                // Parse the response string to extract structured data
                const metrics = this.extractSection(response, 'metrics') || {};
                const insights = this.extractListSection(response, 'insights') || [];
                const recommendations = this.extractListSection(response, 'recommendations') || [];
                const risks = this.extractListSection(response, 'risks') || [];
                const mainResponse = this.extractSection(response, 'response') || '';
                logger.info(`Business analyst tool execution successful`);
                // Return in the format expected by MCP
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                response: mainResponse,
                                metrics,
                                insights,
                                recommendations,
                                risks
                            }, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.error(`Error executing business analyst tool: ${errorMessage}`);
                return {
                    content: [{
                            type: "text",
                            text: `Failed to get business insights: ${errorMessage}`
                        }],
                    isError: true
                };
            }
        });
        // Data Retrieval Tool
        this.server.tool('suada_data_retrieval', {
            dataSource: zod_1.z.string().describe('The name of the data source to query'),
            query: zod_1.z.string().describe('The query to execute against the data source'),
            externalUserIdentifier: zod_1.z.string().optional().describe('Optional user identifier for tracking and personalization')
        }, async ({ dataSource, query, externalUserIdentifier = this.defaultExternalUserIdentifier }) => {
            try {
                logger.info(`Executing data retrieval tool. Data source: ${dataSource}, Query: ${query}`);
                // Call Suada API
                const response = await this.suada.chat({
                    message: `Retrieve data from ${dataSource}: ${query}`,
                    externalUserIdentifier: externalUserIdentifier
                });
                // Extract the main response
                const data = this.extractSection(response, 'response') || response;
                logger.info(`Data retrieval tool execution successful`);
                // Return in the format expected by MCP
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                data,
                                metadata: {
                                    source: dataSource,
                                    query
                                }
                            }, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.error(`Error executing data retrieval tool: ${errorMessage}`);
                return {
                    content: [{
                            type: "text",
                            text: `Failed to retrieve data: ${errorMessage}`
                        }],
                    isError: true
                };
            }
        });
    }
    /**
     * Extract a section from the response string using XML-like tags
     */
    extractSection(response, sectionName) {
        const regex = new RegExp(`<${sectionName}>(.*?)</${sectionName}>`, 'si');
        const match = response.match(regex);
        if (!match || !match[1])
            return '';
        const content = match[1].trim();
        // For metrics, we convert to an object
        if (sectionName === 'metrics') {
            const metricsObj = {};
            const lines = content.split('\n');
            for (const line of lines) {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    metricsObj[key] = value;
                }
            }
            return metricsObj;
        }
        return content;
    }
    /**
     * Extract a list section from the response
     */
    extractListSection(response, sectionName) {
        const content = this.extractSection(response, sectionName);
        if (typeof content !== 'string' || !content)
            return [];
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }
    /**
     * Start the MCP server
     */
    async run() {
        try {
            const transport = new stdio_js_1.StdioServerTransport();
            await this.server.connect(transport);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error running MCP server: ${errorMessage}`);
            process.exit(1);
        }
    }
}
/**
 * Main entry point
 */
async function main() {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const apiKeyIndex = args.indexOf('--api-key');
        const apiKey = apiKeyIndex >= 0 && apiKeyIndex < args.length - 1 ? args[apiKeyIndex + 1] : undefined;
        // Create and run the server
        const server = new SuadaMCPServer(apiKey);
        await server.run();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error initializing server: ${errorMessage}`);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=suada-server.js.map