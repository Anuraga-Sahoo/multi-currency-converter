// favorites.js - Favorites Management

document.addEventListener('DOMContentLoaded', function() {
    // Load saved favorites when the page loads
    loadFavorites();
    
    // Event listener for the save favorite button
    const saveFavoriteButton = document.getElementById('save-favorite');
    if (saveFavoriteButton) {
        saveFavoriteButton.addEventListener('click', saveCurrentAsFavorite);
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: saveCurrentAsFavorite
 * Description: Saves the current conversion as a favorite in localStorage.
 * Parameters: None
 * Returns: None
 * Usage: Called when the user clicks the "Save as Favorite" button.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function validates the input amount and checks for duplicates before saving.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function saveCurrentAsFavorite() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    // Input validation
    if (!amount || isNaN(amount) || amount <= 0) {
        return;
    }
    
    // Create favorite object
    const favorite = {
        id: Date.now(), // Use timestamp as unique ID
        amount: parseFloat(amount),
        fromCurrency,
        toCurrency,
        dateAdded: new Date().toISOString()
    };
    
    // Get existing favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    
    // Check if this conversion is already saved
    const isDuplicate = favorites.some(fav => 
        fav.fromCurrency === fromCurrency && 
        fav.toCurrency === toCurrency
    );
    
    if (!isDuplicate) {
        // Add new favorite
        favorites.push(favorite);
        
        // Limit to 10 favorites maximum (remove oldest if needed)
        if (favorites.length > 10) {
            favorites.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            favorites = favorites.slice(-10);
        }
        
        // Save back to localStorage
        localStorage.setItem('currencyFavorites', JSON.stringify(favorites));
        
        // Update favorites display
        loadFavorites();
        
        // Change button to indicate success
        const saveButton = document.getElementById('save-favorite');
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
        saveButton.classList.remove('btn-outline-primary');
        saveButton.classList.add('btn-success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            saveButton.innerHTML = '<i class="far fa-star"></i> Save as Favorite';
            saveButton.classList.remove('btn-success');
            saveButton.classList.add('btn-outline-primary');
        }, 2000);
    } else {
        // Visual feedback for duplicate
        const saveButton = document.getElementById('save-favorite');
        saveButton.innerHTML = '<i class="fas fa-info-circle"></i> Already Saved';
        saveButton.classList.remove('btn-outline-primary');
        saveButton.classList.add('btn-warning');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            saveButton.innerHTML = '<i class="far fa-star"></i> Save as Favorite';
            saveButton.classList.remove('btn-warning');
            saveButton.classList.add('btn-outline-primary');
        }, 2000);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: loadFavorites
 * Description: Loads and displays saved favorites from localStorage.
 * Parameters: None
 * Returns: None
 * Usage: Called when the page loads and when a new favorite is saved.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function sorts favorites by date added and creates a card for each one.
    *        - It also fetches the latest conversion rate for each favorite.
    *       - The function handles the case where there are no favorites saved.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadFavorites() {
    // Get favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    const favoritesContainer = document.getElementById('favorites-list');
    const noFavoritesMessage = document.getElementById('no-favorites');
    
    // Clear container
    favoritesContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        noFavoritesMessage.classList.remove('d-none');
        return;
    }
    
    // Hide no favorites message
    noFavoritesMessage.classList.add('d-none');
    
    // Sort favorites with newest first
    favorites.sort((a, b) => {
        return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
    });
    
    // Create favorite cards
    favorites.forEach(favorite => {
        const { id, amount, fromCurrency, toCurrency } = favorite;
        
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-3');
        col.setAttribute('data-favorite-id', id);
        
        const card = document.createElement('div');
        card.classList.add('card', 'h-100', 'favorite-card');
        
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        
        const pairTitle = document.createElement('h5');
        pairTitle.classList.add('card-title', 'd-flex', 'align-items-center', 'justify-content-between');
        
        const pairText = document.createElement('span');
        pairText.textContent = `${fromCurrency} → ${toCurrency}`;
        
        const starIcon = document.createElement('i');
        starIcon.classList.add('fas', 'fa-star', 'text-warning');
        
        pairTitle.appendChild(pairText);
        pairTitle.appendChild(starIcon);
        
        const amountText = document.createElement('p');
        amountText.classList.add('card-text');
        amountText.textContent = `Amount: ${amount.toFixed(2)}`;
        
        // Live conversion result (will be updated via API call)
        const liveResult = document.createElement('p');
        liveResult.classList.add('card-text', 'live-result');
        liveResult.innerHTML = '<small class="text-muted">Click "Convert Now" for live rate</small>';
        
        // Button group
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('mt-3', 'd-flex', 'justify-content-between');
        
        // "Convert Now" button
        const updateButton = document.createElement('button');
        updateButton.classList.add('btn', 'btn-sm', 'btn-primary');
        updateButton.textContent = 'Convert Now';
        updateButton.addEventListener('click', () => {
            // Update form values and trigger conversion
            document.getElementById('amount').value = amount;
            document.getElementById('from-currency').value = fromCurrency;
            document.getElementById('to-currency').value = toCurrency;
            document.getElementById('converter-form').dispatchEvent(new Event('submit'));
            
            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Visual feedback
            updateButton.textContent = 'Converting...';
            setTimeout(() => {
                updateButton.textContent = 'Convert Now';
            }, 1000);
        });
        
        // "Delete" button
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.setAttribute('title', 'Remove from favorites');
        deleteButton.addEventListener('click', () => {
            // Confirm delete
            if (confirm('Remove this favorite?')) {
                removeFavorite(id);
            }
        });
        
        // Add buttons to button group
        buttonGroup.appendChild(updateButton);
        buttonGroup.appendChild(deleteButton);
        
        // Assemble card
        cardBody.appendChild(pairTitle);
        cardBody.appendChild(amountText);
        cardBody.appendChild(liveResult);
        cardBody.appendChild(buttonGroup);
        card.appendChild(cardBody);
        col.appendChild(card);
        
        // Add to container
        favoritesContainer.appendChild(col);
        
        // Fetch and display current rate for this favorite
        fetchFavoriteRate(fromCurrency, toCurrency, liveResult);
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: fetchFavoriteRate
  * Description: Fetches the latest conversion rate for a given currency pair and updates the result element.
  * Parameters: fromCurrency (string), toCurrency (string), resultElement (HTMLElement)
  * Returns: None
  * Usage: Called when loading favorites to display the latest conversion rate.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function validates the input amount and checks for duplicates before saving.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fetchFavoriteRate(fromCurrency, toCurrency, resultElement) {
    // Add loading indicator
    resultElement.innerHTML = '<small class="text-muted">Loading latest rate...</small>';
    
    // Fetch latest conversion rate
    fetch(`/api/convert?from=${fromCurrency}&to=${toCurrency}&amount=1`)
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
            
            // Display latest rate
            const rate = data.conversion_rate;
            const dateUpdated = new Date().toLocaleDateString();
            
            resultElement.innerHTML = `
                <strong class="d-block">Rate: ${rate.toFixed(4)}</strong>
                <small class="text-muted">Updated: ${dateUpdated}</small>
            `;
        })
        .catch(error => {
            // Show error message
            resultElement.innerHTML = '<small class="text-danger">Could not load latest rate</small>';
            console.error('Failed to fetch rate:', error);
        });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: removeFavorite
  * Description: Removes a favorite from localStorage and updates the UI.
  * Parameters: id (number) - The ID of the favorite to remove.
  * Returns: None
  * Usage: Called when the user clicks the "Delete" button on a favorite card.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function handles the case where the favorite is not found in localStorage.
    *       - It also includes a fade-out animation for the card being removed.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function removeFavorite(id) {
    // Get current favorites
    let favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    
    // Filter out the favorite to remove
    favorites = favorites.filter(fav => fav.id !== id);
    
    // Save back to localStorage
    localStorage.setItem('currencyFavorites', JSON.stringify(favorites));
    
    // Find and remove the element from DOM with animation
    const favoriteElement = document.querySelector(`[data-favorite-id="${id}"]`);
    if (favoriteElement) {
        // Add fade-out animation
        favoriteElement.style.transition = 'all 0.3s ease';
        favoriteElement.style.opacity = '0';
        favoriteElement.style.transform = 'scale(0.8)';
        
        // Remove after animation completes
        setTimeout(() => {
            favoriteElement.remove();
            
            // Check if we need to show the "no favorites" message
            if (favorites.length === 0) {
                document.getElementById('no-favorites').classList.remove('d-none');
            }
        }, 300);
    } else {
        // If direct DOM removal failed, reload all favorites
        loadFavorites();
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Function: clearAllFavorites
 * Description: Clears all saved favorites from localStorage and updates the UI.
 * Parameters: None
 * Returns: None
 * Usage: Called when the user clicks the "Clear All" button.
 * Author: Ojas Ulhas Dighe
 * Date: 29 Apr 2025
    * Notes: - The function confirms with the user before clearing all favorites.
    *        - It also handles the case where there are no favorites saved.
**/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function clearAllFavorites() {
    if (confirm('Are you sure you want to remove all favorites?')) {
        // Clear localStorage
        localStorage.removeItem('currencyFavorites');
        
        // Reload favorites display
        loadFavorites();
    }
}