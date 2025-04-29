"""
Error handling module for the Currency Converter application
"""

from flask import jsonify, current_app
import logging
import traceback
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

####################################################################################################################
# Class: APIError
# Description: Custom error class for API errors
# Parameters:
#     message (str): Error message
#     status_code (int): HTTP status code (default: 400)
# Returns:
#     None
# Raises:
#     None
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
#################################################################################################################### 

class APIError(Exception):
    """Custom API error class"""

####################################################################################################################
# Function: __init__
# Description: Initialize the APIError with message and status code
# Parameters:
#     message (str): Error message
#     status_code (int): HTTP status code (default: 400)
# Returns:
#     None
# Raises:
#     None
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
#################################################################################################################### 
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

####################################################################################################################
# Function: to_dict
# Description: Convert error to dictionary for JSON response
# Parameters:
#     None
# Returns:
#     dict: Dictionary representation of the error
# Raises:
#     None
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
####################################################################################################################     
    def to_dict(self):
        """Convert error to dictionary for JSON response"""
        error_dict = dict(self.payload or ())
        error_dict['error'] = self.message
        return error_dict

####################################################################################################################
# Function: handle_api_error
# Description: Register error handlers with Flask app
# Parameters:
#     app (Flask): Flask application instance
# Returns:
#     None
# Raises:
#     None
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
#################################################################################################################### 
    def handle_api_error(app):
        """Register error handlers with Flask app"""
    
    # Handle custom API errors
    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response
    
    # Handle generic 404 errors
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found"}), 404
    
    # Handle generic 500 errors
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Server error: {str(error)}\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500

####################################################################################################################
# Function: api_error_handler
# Description: Decorator for API routes to handle errors consistently
# Parameters:
#     f (function): Function to be decorated
# Returns:
#     function: Decorated function
# Raises:
#     None
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
#################################################################################################################### 
def api_error_handler(f):
    """Decorator for API routes to handle errors consistently"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except APIError as e:
            # Re-raise API errors for the global handler
            raise
        except Exception as e:
            # Log unexpected errors and return a generic response
            logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
            return jsonify({"error": "An unexpected error occurred"}), 500
    return decorated_function