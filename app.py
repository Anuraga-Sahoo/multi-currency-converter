from flask import Flask, render_template, request, jsonify
import requests
import json
import os
from datetime import datetime, timedelta
from config import API_KEY, BASE_URL
from flask_cors import CORS # Importing CORS for cross-origin resource sharing


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Home page route
@app.route('/')
def index():
    return render_template('index.html')

# API endpoint to fetch current exchange rates
@app.route('/api/rates', methods=['GET'])

####################################################################################################################
# Function: get_rates
# Description: Fetch current exchange rates from the API
# Parameters:
#     None
# Returns:
#     JSON response with exchange rates or error message
# Raises:
#     requests.exceptions.RequestException: If the request fails
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
#################################################################################################################### 

def get_rates():
    base_currency = request.args.get('base', 'USD')
    
    try:
        # Fetch data from ExchangeRate-API
        response = requests.get(f"{BASE_URL}/latest/{base_currency}", headers={'apikey': API_KEY})
        response.raise_for_status()
        
        data = response.json()
        
        # Ensure the response contains the expected fields
        if 'result' in data and data['result'] == 'success' and 'conversion_rates' in data:
            # Handle ExchangeRate-API v6 format which uses 'conversion_rates' instead of 'rates'
            return jsonify({
                'base': base_currency,
                'rates': data['conversion_rates'],
                'timestamp': datetime.now().timestamp()
            })
        else:
            return jsonify(data)  # Return the original format if it doesn't need transformation
            
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Unable to fetch exchange rates", "details": str(e)}), 500

# API endpoint to convert currency
@app.route('/api/convert', methods=['GET'])

####################################################################################################################
# Function: convert_currency
# Description: Convert currency using the API
# Parameters:
#     None
# Returns:
#     JSON response with conversion result or error message
# Raises:
#     requests.exceptions.RequestException: If the request fails
#     ValueError: If the amount is not a valid number
#     KeyError: If the response does not contain expected fields
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
####################################################################################################################
def convert_currency():
    from_currency = request.args.get('from', 'USD')
    to_currency = request.args.get('to', 'EUR')
    amount = request.args.get('amount', 1)
    
    try:
        # Validate amount
        amount = float(amount)
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
            
        # Fetch conversion data
        response = requests.get(
            f"{BASE_URL}/pair/{from_currency}/{to_currency}/{amount}",
            headers={'apikey': API_KEY}
        )
        response.raise_for_status()
        
        data = response.json()
        
        # Ensure the response contains the expected fields
        if 'result' in data and data['result'] == 'success':
            # Format might already be correct, but ensure consistent field names
            return jsonify({
                'base': from_currency,
                'target': to_currency,
                'amount': amount,
                'conversion_rate': data.get('conversion_rate', 0),
                'conversion_result': data.get('conversion_result', 0),
                'timestamp': datetime.now().timestamp()
            })
        else:
            return jsonify(data)  # Return the original format
            
    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Conversion failed", "details": str(e)}), 500

# API endpoint to fetch historical data for charts
@app.route('/api/history', methods=['GET'])

####################################################################################################################
# Function: get_history
# Description: Fetch historical exchange rates for a given period
# Parameters:
#     None
# Returns:
#     JSON response with conversion result or error message
# Raises:
#     requests.exceptions.RequestException: If the request fails
#     ValueError: If the amount is not a valid number
#     KeyError: If the response does not contain expected fields
# Author: Ojas Ulhas Dighe
# Date: 29 Apr 2025
####################################################################################################################
def get_history():
    base_currency = request.args.get('base', 'USD')
    target_currency = request.args.get('target', 'EUR')
    days = int(request.args.get('days', 7))
    
    # Limit to reasonable range
    if days > 30:
        days = 30
    
    historical_data = []
    
    try:
        # Fetch data for each day in the range
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            
            # Fetch historical data from API
            response = requests.get(
                f"{BASE_URL}/{date}/{base_currency}",
                headers={'apikey': API_KEY}
            )
            response.raise_for_status()
            data = response.json()
            
            # Check for the expected structure in the response
            if 'result' in data and data['result'] == 'success':
                if 'conversion_rates' in data and target_currency in data['conversion_rates']:
                    # Handle v6 API format
                    historical_data.append({
                        'date': date,
                        'rate': data['conversion_rates'][target_currency]
                    })
                elif 'rates' in data and target_currency in data['rates']:
                    # Handle alternative format
                    historical_data.append({
                        'date': date,
                        'rate': data['rates'][target_currency]
                    })
        
        # If we got no data, raise an exception
        if not historical_data:
            return jsonify({
                "error": "No historical data available for the specified currencies"
            }), 404
            
        return jsonify(historical_data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch historical data", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0'  , port=int(os.environ.get('PORT', 5000)))
    # Set debug to True for development, False for production