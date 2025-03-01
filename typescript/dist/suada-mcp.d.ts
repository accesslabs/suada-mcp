/**
 * Suada Model Context Protocol (MCP) Implementation
 *
 * This module implements the Model Context Protocol for Suada, allowing models
 * to retrieve and reason over custom data feeds through Suada's data pipelines.
 */
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
export declare class SuadaMCP {
    private apiKey;
    private baseUrl;
    private externalUserIdentifier?;
    private client;
    /**
     * Initialize the Suada MCP client
     *
     * @param config - Configuration for the Suada MCP client
     */
    constructor(config: SuadaMCPConfig);
    /**
     * Process an MCP request through Suada
     *
     * @param request - The MCP request to process
     * @returns A promise that resolves to an MCPResponse
     */
    process(request: MCPRequest): Promise<MCPResponse>;
    /**
     * Create a LangChain tool that uses this MCP
     *
     * @param name - Name of the tool
     * @param description - Description of the tool
     * @returns A LangChain tool that can be used in agents
     */
    createLangChainTool(name?: string, description?: string): {
        [x: string]: any;
        name: string;
        description: string;
        mcp: SuadaMCP;
        _call(query: string): Promise<string>;
    };
}
