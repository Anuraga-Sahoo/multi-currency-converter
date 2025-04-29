document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const CURRENCIES = [
        {code: 'USD', name: 'US Dollar', symbol: '$'},
        {code: 'EUR', name: 'Euro', symbol: '€'},
        {code: 'GBP', name: 'British Pound', symbol: '£'},
        {code: 'JPY', name: 'Japanese Yen', symbol: '¥'},
        {code: 'AUD', name: 'Australian Dollar', symbol: 'A$'},
        {code: 'CAD', name: 'Canadian Dollar', symbol: 'C$'},
        {code: 'CHF', name: 'Swiss Franc', symbol: 'Fr'},
        {code: 'CNY', name: 'Chinese Yuan', symbol: '¥'},
        {code: 'INR', name: 'Indian Rupee', symbol: '₹'},
        {code: 'MXN', name: 'Mexican Peso', symbol: '$'},
        {code: 'SGD', name: 'Singapore Dollar', symbol: 'S$'},
        {code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$'},
        {code: 'BRL', name: 'Brazilian Real', symbol: 'R$'},
        {code: 'ZAR', name: 'South African Rand', symbol: 'R'},
        {code: 'RUB', name: 'Russian Ruble', symbol: '₽'},
        {code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$'},
        {code: 'SEK', name: 'Swedish Krona', symbol: 'kr'},
        {code: 'NOK', name: 'Norwegian Krone', symbol: 'kr'},
        {code: 'TRY', name: 'Turkish Lira', symbol: '₺'},
        {code: 'KRW', name: 'South Korean Won', symbol: '₩'}
    ];
    
    // DOM Elements
    const converterForm = document.getElementById('converter-form');
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const swapButton = document.getElementById('swap-button');
    const resultContainer = document.getElementById('result-container');
    const conversionResult = document.getElementById('conversion-result');
    const conversionRate = document.getElementById('conversion-rate');
    const lastUpdated = document.getElementById('last-updated');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const baseCurrencyDropdown = document.getElementById('base-currency-dropdown');
    const popularRatesContainer = document.getElementById('popular-rates');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Initialize
    populateCurrencySelects();
    populateBaseCurrencyDropdown();
    loadPopularRates('USD');
    initializeCharts();
    loadFavorites();
    
    // Set default values
    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'EUR';
    
    // Event Listeners
    converterForm.addEventListener('submit', handleConversion);
    swapButton.addEventListener('click', swapCurrencies);
    saveFavoriteButton.addEventListener('click', saveCurrentAsFavorite);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add event listeners for currency changes to update chart automatically
    fromCurrencySelect.addEventListener('change', updateChartFromSelects);
    toCurrencySelect.addEventListener('change', updateChartFromSelects);
    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: populateCurrencySelects
 * Description: Populates the currency select dropdowns with available currencies.
 * Parameters: None
 * Returns: None
 * Usage: Called on DOMContentLoaded to initialize the currency dropdowns.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - This function iterates through the CURRENCIES array and creates option elements for each currency.
    *        - Each option element is appended to the respective select element (fromCurrencySelect and toCurrencySelect).
    *       - The createCurrencyOption function is used to create the option elements.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function populateCurrencySelects() {
        CURRENCIES.forEach(currency => {
            const fromOption = createCurrencyOption(currency);
            const toOption = createCurrencyOption(currency);
            
            fromCurrencySelect.appendChild(fromOption);
            toCurrencySelect.appendChild(toOption);
        });
    }
    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: createCurrencyOption
 * Description: Creates an option element for a currency.
 * Parameters: currency (object) - The currency object containing code, name, and symbol.
 * Returns: option (HTMLSelectElement) - The created option element.
 * Usage: Used in populateCurrencySelects to create options for the currency select dropdowns.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - This function creates an option element with the currency code as the value and the currency name as the text content.
    *       - The option element is returned to be appended to the select element.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function createCurrencyOption(currency) {
        const option = document.createElement('option');
        option.value = currency.code;
        option.textContent = `${currency.code} - ${currency.name}`;
        return option;
    }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: populateBaseCurrencyDropdown
 * Description: Populates the base currency dropdown with available currencies.
 * Parameters: None
 * Returns: None
 * Usage: Called on DOMContentLoaded to initialize the base currency dropdown.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - This function iterates through the CURRENCIES array and creates list items for each currency.
    *        - Each list item is appended to the baseCurrencyDropdown element.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    function populateBaseCurrencyDropdown() {
        CURRENCIES.forEach(currency => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.classList.add('dropdown-item');
            a.href = '#';
            a.textContent = `${currency.code} - ${currency.name}`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('baseDropdown').textContent = `Base: ${currency.code}`;
                loadPopularRates(currency.code);
            });
            li.appendChild(a);
            baseCurrencyDropdown.appendChild(li);
        });
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: handleConversion
 * Description: Handles the conversion process when the form is submitted.
 * Parameters: e (Event) - The event object from the form submission.
 * Returns: None
 * Usage: Called when the user submits the conversion form.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function validates the input amount and fetches conversion data from the API.
    *        - It also updates the chart with the selected currencies.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    function handleConversion(e) {
        e.preventDefault();
        
        // Hide previous results/errors
        errorContainer.classList.add('d-none');
        
        const amount = amountInput.value;
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        
        // Basic validation
        if (!amount || isNaN(amount) || amount <= 0) {
            showError('Please enter a valid amount greater than zero.');
            return;
        }
        
        // Fetch conversion data
        fetchConversion(amount, fromCurrency, toCurrency);
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: fetchConversion
 * Description: Fetches conversion data from the API and updates the UI.
 * Parameters: amount (number) - The amount to convert.
 *           fromCurrency (string) - The currency to convert from.
 *          toCurrency (string) - The currency to convert to.
 * Returns: None
 * Usage: Called when the user submits the conversion form.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function makes a fetch request to the API and handles the response.
    *        - It updates the conversion result and rate in the UI.
**/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

    function fetchConversion(amount, fromCurrency, toCurrency) {
        fetch(`/api/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                displayResult(data, amount, fromCurrency, toCurrency);
                // Update chart when conversion is performed
                updateChart(fromCurrency, toCurrency);
            })
            .catch(error => {
                showError(`Conversion failed: ${error.message}`);
            });
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: displayResult
 * Description: Displays the conversion result and rate in the UI.
 * Parameters: data (object) - The conversion data from the API.
 *          amount (number) - The amount to convert.
 *       fromCurrency (string) - The currency to convert from.
 *      toCurrency (string) - The currency to convert to.
 * Returns: None
 * Usage: Called after fetching conversion data from the API.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function updates the conversion result and rate in the UI.
    *        - It also sets the last updated time.
**/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

    function displayResult(data, amount, fromCurrency, toCurrency) {
        const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
        const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);
        
        const convertedAmount = data.conversion_result;
        const rate = data.conversion_rate;
        
        conversionResult.textContent = `${amount} ${fromCurrency} = ${toCurrencyData.symbol}${convertedAmount.toFixed(2)} ${toCurrency}`;
        conversionRate.textContent = `1 ${fromCurrency} = ${toCurrencyData.symbol}${rate.toFixed(4)} ${toCurrency}`;
        
        // Set last updated time
        const now = new Date();
        lastUpdated.textContent = `Last updated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        
        // Show result container
        resultContainer.classList.remove('d-none');
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: swapCurrencies
 * Description: Swaps the selected currencies in the dropdowns.
 * Parameters: None
 * Returns: None
 * Usage: Called when the user clicks the "Swap" button.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function swaps the values of the fromCurrencySelect and toCurrencySelect elements.
    *        - It also updates the chart after swapping.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    function swapCurrencies() {
        const temp = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = temp;
        
        // Update chart after swapping
        updateChartFromSelects();
    }
    

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: updateChartFromSelects
 * Description: Updates the chart based on the selected currencies in the dropdowns.
 * Parameters: None
 * Returns: None
 * Usage: Called when the user changes the selected currencies in the dropdowns.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function retrieves the selected currencies and calls the updateChart function.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
   
    function updateChartFromSelects() {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        updateChart(fromCurrency, toCurrency);
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: loadFavorites
 * Description: Loads and displays the user's favorite currency conversions from local storage.
 * Parameters: None
 * Returns: None
 * Usage: Called on DOMContentLoaded to initialize the favorites list.  
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function retrieves the favorites from local storage and displays them in the favorites container.
    *        - It also adds event listeners to remove buttons for each favorite.
**/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favoritesContainer.innerHTML = ''; // Clear previous favorites

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p class="text-muted">No favorites saved.</p>';
            return;
        }

        favorites.forEach(favorite => {
            const { fromCurrency, toCurrency } = favorite;
            const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
            const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);
        });
        
        const favoritesContainer = document.getElementById('favorites-container');
        favoritesContainer.innerHTML = ''; // Clear previous favorites
    
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        li.innerHTML = `

            <span>${fromCurrencyData.code} to ${toCurrencyData.code}</span>
            <button class="btn btn-danger btn-sm remove-favorite" data-from="${fromCurrency}" data-to="${toCurrency}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        favoritesContainer.appendChild(li);
        li.querySelector('.remove-favorite').addEventListener('click', removeFavorite);

        const removeButtons = favoritesContainer.querySelectorAll('.remove-favorite');
        removeButtons.forEach(button => {
            button.addEventListener('click', removeFavorite);
        });
    }
    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: loadPopularRates
 * Description: Loads and displays popular currency rates based on the selected base currency.
 * Parameters: baseCurrency (string) - The base currency to fetch rates for.
 * Returns: None
 * Usage: Called when the user selects a base currency from the dropdown.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function fetches popular currency rates from the API and displays them in the popular rates container.
    *        - It handles errors and displays a warning message if the rates cannot be loaded.
**/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    function loadPopularRates(baseCurrency) {
        fetch(`/api/rates?base=${baseCurrency}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Check if rates property exists
                if (!data.rates) {
                    console.error('API response missing rates property:', data);
                    throw new Error('Invalid API response format');
                }
                
                displayPopularRates(data, baseCurrency);
            })
            .catch(error => {
                console.error('Failed to load popular rates:', error);
                // Add visual feedback
                popularRatesContainer.innerHTML = `
                    <div class="col-12 text-center p-4">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i> 
                            Unable to load currency rates. Please try again later.
                        </div>
                    </div>
                `;
            });
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: displayPopularRates
 * Description: Displays popular currency rates in the UI.
 * Parameters: data (object) - The rates data from the API.
 *         baseCurrency (string) - The base currency for the rates.
 * Returns: None
 * Usage: Called after fetching popular rates from the API.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function creates cards for popular currencies and displays their rates.
    *        - It handles cases where the rate data is invalid or missing.
    *        - It also adds visual feedback for missing rates.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////     
    function displayPopularRates(data, baseCurrency) {
        // Clear container
        popularRatesContainer.innerHTML = '';
        
        // Check if rates property exists
        if (!data.rates || typeof data.rates !== 'object') {
            popularRatesContainer.innerHTML = `
                <div class="col-12 text-center p-4">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Invalid rate data received. Please try again later.
                    </div>
                </div>
            `;
            return;
        }
        
        // Create cards for 8 popular currencies
        const popularCurrencyCodes = CURRENCIES.filter(c => c.code !== baseCurrency)
            .slice(0, 8)
            .map(c => c.code);
        
        popularCurrencyCodes.forEach(currencyCode => {
            const rate = data.rates[currencyCode];
            
            // Skip if rate is undefined for this currency
            if (rate === undefined) {
                console.warn(`Rate for ${currencyCode} is not available`);
                return;
            }
            
            const currency = CURRENCIES.find(c => c.code === currencyCode);
            
            const col = document.createElement('div');
            col.classList.add('col-md-3', 'col-sm-6', 'mb-3');
            
            const card = document.createElement('div');
            card.classList.add('card', 'h-100', 'popular-rate-card');
            
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body', 'text-center');
            
            const currencyTitle = document.createElement('h5');
            currencyTitle.classList.add('card-title');
            currencyTitle.textContent = currency.code;
            
            const currencyName = document.createElement('p');
            currencyName.classList.add('card-text', 'small', 'text-muted');
            currencyName.textContent = currency.name;
            
            const rateDisplay = document.createElement('p');
            rateDisplay.classList.add('card-text', 'display-6', 'mt-2');
            rateDisplay.textContent = `${currency.symbol}${rate.toFixed(2)}`;
            
            const exchangeRate = document.createElement('p');
            exchangeRate.classList.add('card-text', 'small');
            exchangeRate.textContent = `1 ${baseCurrency} = ${currency.symbol}${rate.toFixed(4)}`;
            
            cardBody.appendChild(currencyTitle);
            cardBody.appendChild(currencyName);
            cardBody.appendChild(rateDisplay);
            cardBody.appendChild(exchangeRate);
            card.appendChild(cardBody);
            col.appendChild(card);
            
            popularRatesContainer.appendChild(col);
        });
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: showError
 * Description: Displays an error message in the UI.
 * Parameters: message (string) - The error message to display.
 * Returns: None
 * Usage: Called when an error occurs during API requests or validation.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function updates the error message text and shows the error container.
    *        - It hides the result container if an error occurs.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////     
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('d-none');
        resultContainer.classList.add('d-none');
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: toggleTheme
 * Description: Toggles between light and dark themes.
 * Parameters: None
 * Returns: None
 * Usage: Called when the user clicks the theme toggle button.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function changes the theme stylesheet and updates the button text accordingly.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////     
    function toggleTheme() {
        const themeStyle = document.getElementById('theme-style');
        const isDarkMode = themeStyle.getAttribute('href').includes('dark-mode');
        
        if (isDarkMode) {
            themeStyle.setAttribute('href', '/static/css/light-mode.css');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        } else {
            themeStyle.setAttribute('href', '/static/css/dark-mode.css');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }
    
    // Initial chart update with default values
    updateChart(fromCurrencySelect.value, toCurrencySelect.value);
});