let ratesChart;

function initializeCharts() {
    const ctx = document.getElementById('rates-chart').getContext('2d');
    
    ratesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Exchange Rate',
                data: [],
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#0d6efd',
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Rate: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }
                }
            }
        }
    });
    
    // Initial chart with USD to EUR
    updateChart('USD', 'EUR');
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: updateChart
 * Purpose: Updates the chart with historical exchange rates based on selected currencies.
 * Description: Fetches historical exchange rates from the server and updates the chart with the new data.
 * Parameters:
 *  - fromCurrency: The base currency for the exchange rate.
 * - toCurrency: The target currency for the exchange rate.
 * Returns: None
 * Usage: Called when the user changes the selected currencies in the dropdowns.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
 * Notes: - The function retrieves the selected currencies and calls the updateChart function.
 * - The function handles errors and updates the chart with loading and error states.
 * - The function also adds a visual error indicator beneath the chart in case of an error.
 * - The function sorts the historical data by date before updating the chart.
**/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

function updateChart(fromCurrency, toCurrency) {
    // Show loading state on chart
    if (ratesChart) {
        ratesChart.data.labels = ['Loading...'];
        ratesChart.data.datasets[0].data = [0];
        ratesChart.update();
    }
    
    // Log the request for debugging
    console.log(`Updating chart for ${fromCurrency} to ${toCurrency}`);
    
    fetch(`/api/history?base=${fromCurrency}&target=${toCurrency}&days=7`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Log received data for debugging
            console.log('Historical data received:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No historical data available');
            }
            
            // Sort data by date
            data.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const labels = data.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            
            const rates = data.map(item => item.rate);
            
            // Update chart
            ratesChart.data.labels = labels;
            ratesChart.data.datasets[0].data = rates;
            ratesChart.data.datasets[0].label = `${fromCurrency} to ${toCurrency}`;
            ratesChart.update();
            
            console.log('Chart updated successfully');
        })
        .catch(error => {
            console.error('Failed to update chart:', error);
            
            // Show error state on chart
            if (ratesChart) {
                ratesChart.data.labels = ['Error'];
                ratesChart.data.datasets[0].data = [0];
                ratesChart.data.datasets[0].label = `Error loading data: ${error.message}`;
                ratesChart.update();
            }
            
            // Add visual error indicator beneath the chart
            const chartCanvas = document.getElementById('rates-chart');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning mt-2';
            errorDiv.innerHTML = `<small><i class="fas fa-exclamation-triangle"></i> Failed to load chart data: ${error.message}</small>`;
            
            // Remove any existing error messages
            const existingError = chartCanvas.parentNode.querySelector('.alert');
            if (existingError) {
                existingError.remove();
            }
            
            chartCanvas.parentNode.appendChild(errorDiv);
        });
}