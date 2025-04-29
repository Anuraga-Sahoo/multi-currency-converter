import os

# ExchangeRate-API configuration
API_KEY = os.environ.get('EXCHANGE_RATE_API_KEY', '5885d6a81523b9403d3bcd1a')
BASE_URL = 'https://v6.exchangerate-api.com/v6/{}/'.format(API_KEY)

# Application configuration
DEBUG = True
SECRET_KEY = os.environ.get('SECRET_KEY', 'development_secret_key')

# Available currencies
CURRENCIES = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN',
    'SGD', 'NZD', 'BRL', 'ZAR', 'RUB', 'HKD', 'SEK', 'NOK', 'TRY', 'KRW'
]