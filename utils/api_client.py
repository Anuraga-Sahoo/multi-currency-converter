"""
Exchange Rate API Client
Handles all requests to the ExchangeRate-API service
"""

import requests
import json
from datetime import datetime, timedelta
from config import API_KEY, BASE_URL

####################################################################################################################
# Class: ExchangeRateClient
# Description: This class provides methods to interact with the ExchangeRate-API service.
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
####################################################################################################################

class ExchangeRateClient:
    """Client side implementation for interacting with the ExchangeRate-API"""
    
####################################################################################################################
# Function: __init__
# Description: Initialize the client with API key and base URL
# Parameters:
#     api_key (str): API key for authentication (default: API_KEY from config)
#     base_url (str): Base URL for the API (default: BASE_URL from config)
# Returns:
#     None
# Raises:
#     None
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
####################################################################################################################

    def __init__(self, api_key=API_KEY, base_url=BASE_URL):
        """Initialize the client with API key and base URL"""
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {'apikey': self.api_key}
    
####################################################################################################################
# Function: get_latest_rates
# Description: Get latest exchange rates for a base currency
# Parameters:
#     base_currency (str): Base currency code (default: 'USD')
# Returns:
#     dict: Response data with exchange rates
# Raises:
#     requests.exceptions.RequestException: If the request fails
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
####################################################################################################################    

    def get_latest_rates(self, base_currency='USD'):
        """
        Get latest exchange rates for a base currency
        
        Args:
            base_currency (str): Base currency code (default: 'USD')
            
        Returns:
            dict: Response data with exchange rates
        """
        try:
            response = requests.get(
                f"{self.base_url}/latest/{base_currency}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
####################################################################################################################
# Function: convert_currency
# Description: Convert an amount from one currency to another
# Parameters:
#     from_currency (str): Source currency code
#     to_currency (str): Target currency code
#     amount (float): Amount to convert
# Returns:
#     dict: Response data with conversion result
# Raises:
#     requests.exceptions.RequestException: If the request fails
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
####################################################################################################################    
    def convert_currency(self, from_currency, to_currency, amount):
        """
        Convert an amount from one currency to another
        
        Args:
            from_currency (str): Source currency code
            to_currency (str): Target currency code
            amount (float): Amount to convert
            
        Returns:
            dict: Response data with conversion result
        """
        try:
            response = requests.get(
                f"{self.base_url}/pair/{from_currency}/{to_currency}/{amount}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

####################################################################################################################
# Function: get_historical_rates
# Description: Get historical exchange rates for a specific date
# Parameters:
#     date (str): Date in YYYY-MM-DD format
#     base_currency (str): Base currency code (default: 'USD')
# Returns:
#     dict: Response data with historical exchange rates
# Raises:
#     requests.exceptions.RequestException: If the request fails
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
#################################################################################################################### 
    def get_historical_rates(self, date, base_currency='USD'):
        """
        Get historical exchange rates for a specific date
        
        Args:
            date (str): Date in YYYY-MM-DD format
            base_currency (str): Base currency code (default: 'USD')
            
        Returns:
            dict: Response data with historical exchange rates
        """
        try:
            response = requests.get(
                f"{self.base_url}/{date}/{base_currency}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}


####################################################################################################################
# Function: get_rate_history
# Description: Get exchange rate history for a currency pair
# Parameters:
#     base_currency (str): Base currency code
#     target_currency (str): Target currency code
#     days (int): Number of days in history (default: 7)
# Returns:
#     list: Historical data for the specified period
# Raises:
#     None
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
#################################################################################################################### 
    def get_rate_history(self, base_currency, target_currency, days=7):
        """
        Get exchange rate history for a currency pair
        
        Args:
            base_currency (str): Base currency code
            target_currency (str): Target currency code
            days (int): Number of days in history
            
        Returns:
            list: Historical data for the specified period
        """
        historical_data = []
        
        try:
            for i in range(days):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                data = self.get_historical_rates(date, base_currency)
                
                if 'error' not in data and 'rates' in data and target_currency in data['rates']:
                    historical_data.append({
                        'date': date,
                        'rate': data['rates'][target_currency]
                    })
                    
            return historical_data
        except Exception as e:
            return {"error": str(e)}


# Create a singleton instance
exchange_client = ExchangeRateClient()