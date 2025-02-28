#!/usr/bin/env python3
"""
Suada Model Context Protocol (MCP) Server

This module implements a compliant MCP server for Suada, allowing models
to retrieve and reason over custom data feeds through Suada's data pipelines.
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any, Union, Literal
import argparse
from dotenv import load_dotenv

from modelcontextprotocol.server.stdio import StdioServerTransport
from modelcontextprotocol.server.mcp import McpServer
from modelcontextprotocol.server.tool import Tool
from modelcontextprotocol.common.errors import ToolExecutionError

try:
    from suada import Suada, SuadaConfig, ChatPayload
except ImportError:
    raise ImportError(
        "The Suada Python SDK is required. Install it with 'pip install suada'"
    )

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("suada_mcp_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("suada-mcp-server")

# Load environment variables
load_dotenv()

class SuadaMCPServer:
    """
    Suada Model Context Protocol (MCP) Server
    
    This class implements a compliant MCP server for Suada,
    following the official Model Context Protocol specifications.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        server_name: str = "suada",
        server_version: str = "1.0.0"
    ):
        """
        Initialize the Suada MCP server.
        
        Args:
            api_key: Suada API key. If not provided, will look for SUADA_API_KEY env var.
            server_name: Name for the MCP server.
            server_version: Version for the MCP server.
        """
        self.api_key = api_key or os.getenv("SUADA_API_KEY")
        if not self.api_key:
            raise ValueError("Suada API key is required. Provide it as an argument or set SUADA_API_KEY environment variable.")
        
        # Initialize Suada client
        self.suada = Suada(
            config=SuadaConfig(
                api_key=self.api_key
            )
        )
        
        # Initialize MCP server
        self.server = McpServer(
            name=server_name,
            version=server_version
        )
        
        # Register tools
        self._register_tools()
        
        logger.info(f"Initialized Suada MCP server '{server_name}' v{server_version}")
    
    def _register_tools(self):
        """Register all Suada-related tools with the MCP server."""
        
        @self.server.tool(
            name="suada_business_analyst",
            description="Get business insights and analysis from Suada AI. Input should be a specific business question.",
            param_schema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The business question to analyze"
                    }
                },
                "required": ["query"]
            },
            return_schema={
                "type": "object",
                "properties": {
                    "response": {
                        "type": "string",
                        "description": "The business analysis response"
                    },
                    "metrics": {
                        "type": "object",
                        "description": "Key metrics extracted from the analysis"
                    },
                    "insights": {
                        "type": "array",
                        "description": "List of key insights from the analysis",
                        "items": {"type": "string"}
                    },
                    "recommendations": {
                        "type": "array",
                        "description": "List of recommendations based on the analysis",
                        "items": {"type": "string"}
                    },
                    "risks": {
                        "type": "array",
                        "description": "List of potential risks identified in the analysis",
                        "items": {"type": "string"}
                    }
                }
            }
        )
        async def business_analyst(
            query: str
        ) -> Dict[str, Any]:
            """
            Get business insights and analysis from Suada.
            
            Args:
                query: The business question to analyze.
                
            Returns:
                Dictionary containing the analysis results.
            """
            try:
                logger.info(f"Executing business analyst tool. Query: {query}")
                
                # Create the payload
                payload = ChatPayload(
                    message=query
                )
                
                # Call Suada API
                response = self.suada.chat(payload=payload)
                
                # Extract and return the results
                result = {
                    "response": response.response,
                    "metrics": response.metrics or {},
                    "insights": response.insights or [],
                    "recommendations": response.recommendations or [],
                    "risks": response.risks or []
                }
                
                logger.info(f"Business analyst tool execution successful")
                return result
                
            except Exception as e:
                logger.error(f"Error executing business analyst tool: {str(e)}")
                raise ToolExecutionError(f"Failed to get business insights: {str(e)}")
        
        @self.server.tool(
            name="suada_data_retrieval",
            description="Retrieve specific data from a connected data source in Suada.",
            param_schema={
                "type": "object",
                "properties": {
                    "data_source": {
                        "type": "string",
                        "description": "The name of the data source to query"
                    },
                    "query": {
                        "type": "string",
                        "description": "The query to execute against the data source"
                    }
                },
                "required": ["data_source", "query"]
            }
        )
        async def data_retrieval(
            data_source: str,
            query: str
        ) -> Dict[str, Any]:
            """
            Retrieve data from a connected data source in Suada.
            
            Args:
                data_source: The name of the data source to query.
                query: The query to execute against the data source.
                
            Returns:
                Dictionary containing the retrieved data.
            """
            try:
                logger.info(f"Executing data retrieval tool. Data source: {data_source}, Query: {query}")
                
                # Create the payload
                payload = ChatPayload(
                    message=f"Retrieve data from {data_source}: {query}"
                )
                
                # Call Suada API
                response = self.suada.chat(payload=payload)
                
                # Return the results
                result = {
                    "data": response.response,
                    "metadata": {
                        "source": data_source,
                        "query": query
                    }
                }
                
                logger.info(f"Data retrieval tool execution successful")
                return result
                
            except Exception as e:
                logger.error(f"Error executing data retrieval tool: {str(e)}")
                raise ToolExecutionError(f"Failed to retrieve data: {str(e)}")

    async def run(self):
        """Run the MCP server using the specified transport."""
        try:
            transport = StdioServerTransport()
            await self.server.run(transport)
        except Exception as e:
            logger.error(f"Error running MCP server: {str(e)}")
            raise

async def main():
    """Main entry point for the Suada MCP server."""
    parser = argparse.ArgumentParser(description="Suada MCP Server")
    parser.add_argument("--api-key", help="Suada API key")
    args = parser.parse_args()
    
    try:
        server = SuadaMCPServer(api_key=args.api_key)
        await server.run()
    except Exception as e:
        logger.error(f"Error initializing server: {str(e)}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 