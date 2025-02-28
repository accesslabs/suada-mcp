/**
 * Suada Model Context Protocol (MCP) Implementation
 * 
 * This module implements the Model Context Protocol for Suada, allowing models
 * to retrieve and reason over custom data feeds through Suada's data pipelines.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * MCP Request interface
 */
export interface MCPRequest {
    query: string;
    context?: Record<string, any>;
    userId?: string;
    conversationId?: string;
    metadata?: Record<string, any>;
}

/**
 * MCP Response interface
 */
export interface MCPResponse {
    content: string;
    metadata: Record<string, any>;
    error?: string;
}

/**
 * Suada API Response structure
 */
export interface SuadaResponse {
    metrics?: Record<string, string>;
    insights?: string[];
    recommendations?: string[];
    risks?: string[];
    reasoning?: string;
    response: string;
}

/**
 * Suada MCP Configuration
 */
export interface SuadaMCPConfig {
    apiKey: string;
    baseUrl?: string;
    externalUserIdentifier?: string;
}

/**
 * Suada Model Context Protocol implementation
 */
export class SuadaMCP {
    private apiKey: string;
    private baseUrl: string;
    private externalUserIdentifier?: string;
    private client: AxiosInstance;

    /**
     * Initialize the Suada MCP client
     * 
     * @param config - Configuration for the Suada MCP client
     */
    constructor(config: SuadaMCPConfig) {
        this.apiKey = config.apiKey;

        if (!this.apiKey) {
            throw new Error('Suada API key is required');
        }

        this.baseUrl = config.baseUrl?.replace(/\/$/, '') || 'https://suada.ai/api/public';
        this.externalUserIdentifier = config.externalUserIdentifier;

        // Initialize axios client
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'SuadaMCP/1.0 TypeScript'
            }
        });

        console.log(`Initialized Suada MCP client with base URL: ${this.baseUrl}`);
    }

    /**
     * Process an MCP request through Suada
     * 
     * @param request - The MCP request to process
     * @returns A promise that resolves to an MCPResponse
     */
    async process(request: MCPRequest): Promise<MCPResponse> {
        try {
            // Ensure we have a user identifier
            const userId = request.userId || this.externalUserIdentifier;
            if (!userId) {
                throw new Error('User identifier is required. Provide it in the request or during initialization.');
            }

            // Prepare the payload for Suada API
            const payload = {
                message: request.query,
                externalUserIdentifier: userId,
                context: request.context || {}
            } as Record<string, any>;

            // Add conversation ID if available
            if (request.conversationId) {
                payload.conversationId = request.conversationId;
            }

            // Make the API request
            console.log(`Sending request to Suada API: ${request.query}`);
            const response = await this.client.post<SuadaResponse>('/chat', payload);

            // Extract data from the response
            const data = response.data;

            // Extract structured data
            const structuredData = {
                metrics: data.metrics || {},
                insights: data.insights || [],
                recommendations: data.recommendations || [],
                risks: data.risks || [],
                reasoning: data.reasoning || ''
            };

            // Return formatted response
            return {
                content: data.response || '',
                metadata: {
                    suadaData: structuredData,
                    rawResponse: data
                }
            };

        } catch (error) {
            console.error('Error processing MCP request:', error);

            // Handle axios errors
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;

                // Try to extract error details if available
                let errorMessage = 'Failed to communicate with Suada API';
                let statusCode = axiosError.response?.status;

                if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
                    const errorData = axiosError.response.data as any;
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                }

                return {
                    content: '',
                    error: errorMessage,
                    metadata: { statusCode }
                };
            }

            // Handle other errors
            return {
                content: '',
                error: `Unexpected error: ${(error as Error).message || String(error)}`,
                metadata: {}
            };
        }
    }

    /**
     * Create a LangChain tool that uses this MCP
     * 
     * @param name - Name of the tool
     * @param description - Description of the tool
     * @returns A LangChain tool that can be used in agents
     */
    createLangChainTool(name = 'suada_data', description?: string) {
        try {
            // Check if LangChain is available
            // This is a runtime check since we don't want to make LangChain a required dependency
            const langchain = require('langchain/tools');

            const defaultDescription =
                'Use this tool to get business insights and analysis from Suada. ' +
                'Input should be a specific business question.';

            // Create a tool class
            class SuadaTool extends langchain.Tool {
                name = name;
                description = description || defaultDescription;
                mcp: SuadaMCP;

                constructor(mcp: SuadaMCP) {
                    super();
                    this.mcp = mcp;
                }

                async _call(query: string): Promise<string> {
                    const mcpRequest: MCPRequest = { query };
                    const mcpResponse = await this.mcp.process(mcpRequest);

                    if (mcpResponse.error) {
                        return `Error: ${mcpResponse.error}`;
                    }

                    return mcpResponse.content;
                }
            }

            // Return an instance of the tool
            return new SuadaTool(this);

        } catch (error) {
            console.error('LangChain is not installed. Install it with npm install langchain');
            throw new Error('LangChain is required to create a LangChain tool. Install it with npm install langchain');
        }
    }
}

// Example usage
/*
async function example() {
  // Initialize the MCP
  const mcp = new SuadaMCP({
    apiKey: process.env.SUADA_API_KEY || '',
    externalUserIdentifier: 'example_user'
  });
  
  // Create a request
  const request: MCPRequest = {
    query: "What's our revenue trend for the last quarter?",
    context: { timeframe: 'last_quarter' },
    userId: 'example_user'
  };
  
  // Process the request
  const response = await mcp.process(request);
  
  // Print the response
  if (response.error) {
    console.error(`Error: ${response.error}`);
  } else {
    console.log(`Response: ${response.content}`);
    console.log(`Metrics:`, response.metadata.suadaData.metrics);
    console.log(`Insights:`, response.metadata.suadaData.insights);
  }
}
*/ 