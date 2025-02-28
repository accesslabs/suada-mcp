#!/usr/bin/env python3
"""
Suada Model Context Protocol (MCP) Implementation

This module implements the Model Context Protocol for Suada, allowing models
to retrieve and reason over custom data feeds through Suada's data pipelines.
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field, asdict
import requests
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("suada-mcp")

# Load environment variables
load_dotenv()

# MCP Protocol Types
@dataclass
class MCPRequest:
    """Model Context Protocol request structure."""
    query: str
    context: Dict[str, Any] = field(default_factory=dict)
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class MCPResponse:
    """Model Context Protocol response structure."""
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None

class SuadaMCP:
    """
    Suada Model Context Protocol implementation.
    
    This class implements the MCP protocol for Suada, allowing models to
    retrieve and reason over custom data feeds through Suada's data pipelines.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://suada.ai/api/public",
        external_user_identifier: Optional[str] = None
    ):
        """
        Initialize the Suada MCP client.
        
        Args:
            api_key: Suada API key. If not provided, will look for SUADA_API_KEY env var.
            base_url: Base URL for Suada API. Defaults to production API.
            external_user_identifier: Default user identifier to use if not specified in requests.
        """
        self.api_key = api_key or os.getenv("SUADA_API_KEY")
        if not self.api_key:
            raise ValueError("Suada API key is required. Provide it as an argument or set SUADA_API_KEY environment variable.")
        
        self.base_url = base_url.rstrip("/")
        self.external_user_identifier = external_user_identifier
        
        logger.info(f"Initialized Suada MCP client with base URL: {self.base_url}")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for API requests."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "SuadaMCP/1.0 Python"
        }
    
    def process(self, request: MCPRequest) -> MCPResponse:
        """
        Process an MCP request through Suada.
        
        Args:
            request: The MCP request to process.
            
        Returns:
            An MCPResponse object containing the processed result.
        """
        try:
            # Ensure we have a user identifier
            user_id = request.user_id or self.external_user_identifier
            if not user_id:
                raise ValueError("User identifier is required. Provide it in the request or during initialization.")
            
            # Prepare the payload for Suada API
            payload = {
                "message": request.query,
                "externalUserIdentifier": user_id,
                "context": request.context
            }
            
            # Add conversation ID if available
            if request.conversation_id:
                payload["conversationId"] = request.conversation_id
            
            # Make the API request
            logger.info(f"Sending request to Suada API: {request.query}")
            response = requests.post(
                f"{self.base_url}/chat",
                headers=self._get_headers(),
                json=payload
            )
            
            # Handle API errors
            response.raise_for_status()
            
            # Parse the response
            data = response.json()
            
            # Extract structured data from the response
            structured_data = {
                "metrics": data.get("metrics", {}),
                "insights": data.get("insights", []),
                "recommendations": data.get("recommendations", []),
                "risks": data.get("risks", []),
                "reasoning": data.get("reasoning", "")
            }
            
            # Return formatted response
            return MCPResponse(
                content=data.get("response", ""),
                metadata={
                    "suada_data": structured_data,
                    "raw_response": data
                }
            )
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request error: {str(e)}")
            
            # Try to extract error details if available
            error_message = "Failed to communicate with Suada API"
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_data = e.response.json()
                    if "message" in error_data:
                        error_message = error_data["message"]
                except:
                    pass
            
            return MCPResponse(
                content="",
                error=error_message,
                metadata={"status_code": e.response.status_code if hasattr(e, "response") else None}
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return MCPResponse(
                content="",
                error=f"Unexpected error: {str(e)}",
                metadata={}
            )

    def create_langchain_tool(self, name: str = "suada_data", description: str = None):
        """
        Create a LangChain tool that uses this MCP.
        
        Args:
            name: Name of the tool
            description: Description of the tool
            
        Returns:
            A LangChain tool that can be used in agents
        """
        try:
            # Import LangChain dependencies
            from langchain.tools import BaseTool
            
            default_description = (
                "Use this tool to get business insights and analysis from Suada. "
                "Input should be a specific business question."
            )
            
            # Create a LangChain tool class
            class SuadaTool(BaseTool):
                name = name
                description = description or default_description
                
                def _run(self, query: str) -> str:
                    mcp_request = MCPRequest(query=query)
                    mcp_response = self.mcp.process(mcp_request)
                    
                    if mcp_response.error:
                        return f"Error: {mcp_response.error}"
                    
                    return mcp_response.content
                
                async def _arun(self, query: str) -> str:
                    # For simplicity, we're using the sync version
                    return self._run(query)
            
            # Create an instance with reference to this MCP
            tool_instance = SuadaTool()
            tool_instance.mcp = self
            
            return tool_instance
            
        except ImportError:
            logger.error("LangChain is not installed. Install it with 'pip install langchain'")
            raise ImportError("LangChain is required to create a LangChain tool. Install it with 'pip install langchain'")

# Example usage
if __name__ == "__main__":
    # Initialize the MCP
    mcp = SuadaMCP(
        api_key=os.getenv("SUADA_API_KEY"),
        external_user_identifier="example_user"
    )
    
    # Create a request
    request = MCPRequest(
        query="What's our revenue trend for the last quarter?",
        context={"timeframe": "last_quarter"},
        user_id="example_user"
    )
    
    # Process the request
    response = mcp.process(request)
    
    # Print the response
    if response.error:
        print(f"Error: {response.error}")
    else:
        print(f"Response: {response.content}")
        print(f"Metrics: {response.metadata['suada_data']['metrics']}")
        print(f"Insights: {response.metadata['suada_data']['insights']}") 