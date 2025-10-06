/**
 * Cart Handler for Google Sheets Integration
 * Saves cart summary data to Google Sheets
 */

class CartHandler {
    constructor() {
        // Google Apps Script URL for cart data
        this.scriptURL = 'https://script.google.com/macros/s/AKfycbwXiJXjNE-nlHhwsXOm9Yp-pib0YIijjvJpWhBbXCMkXGwr5paeJcycVYKGeN390wJN/exec';
        this.isSubmitting = false;
    }

    /**
     * Collect cart data and send to Google Sheets
     * @param {Object} cartData - The cart summary data
     */
    async submitCartToSheets(cartData) {
        if (this.isSubmitting) return;
        
        try {
            this.isSubmitting = true;
            console.log('Cart data being submitted:', cartData);
            
            // Create a form and submit it (this avoids CORS issues)
            const submitForm = document.createElement('form');
            submitForm.action = this.scriptURL;
            submitForm.method = 'POST';
            submitForm.target = 'cart_hidden_iframe';
            submitForm.style.display = 'none';

            // Add cart data as hidden inputs
            for (const [key, value] of Object.entries(cartData)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = typeof value === 'object' ? JSON.stringify(value) : value;
                submitForm.appendChild(input);
            }

            // Create hidden iframe to capture response
            let iframe = document.getElementById('cart_hidden_iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.name = 'cart_hidden_iframe';
                iframe.id = 'cart_hidden_iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            // Handle iframe load (success)
            iframe.onload = () => {
                console.log('Cart data sent to Google Sheets successfully');
                this.isSubmitting = false;
                
                // Clean up
                if (submitForm.parentNode) {
                    submitForm.parentNode.removeChild(submitForm);
                }
            };

            // Handle iframe error
            iframe.onerror = () => {
                console.error('Cart submission failed');
                this.isSubmitting = false;
            };

            // Submit the form
            document.body.appendChild(submitForm);
            submitForm.submit();

            // Add timeout in case iframe doesn't respond
            setTimeout(() => {
                if (this.isSubmitting) {
                    console.log('Cart submission timeout - assuming success');
                    this.isSubmitting = false;
                    
                    if (submitForm.parentNode) {
                        submitForm.parentNode.removeChild(submitForm);
                    }
                }
            }, 5000);

        } catch (error) {
            console.error('Error saving cart to Google Sheets:', error);
            this.isSubmitting = false;
        }
    }

    /**
     * Extract cart summary data from the current page
     * @returns {Object} Cart data object
     */
    extractCartData() {
        const cartData = {
            timestamp: new Date().toISOString(),
            submissionDate: new Date().toLocaleString(),
            items: [],
            basketType: '',
            netType: '',
            ribbonType: '',
            subtotal: 0,
            discount: 0,
            finalTotal: 0
        };

        try {
            // Extract items from cart
            const cartItems = document.querySelectorAll('.cart-item');
            cartItems.forEach(item => {
                const name = item.querySelector('.cart-item-name')?.textContent || '';
                const price = item.querySelector('.cart-item-price')?.textContent || '';
                const quantity = item.querySelector('.quantity-display')?.textContent || '1';
                const total = item.querySelector('.cart-item-total')?.textContent || '';
                
                if (name) {
                    cartData.items.push({
                        name: name.trim(),
                        price: price.trim(),
                        quantity: parseInt(quantity) || 1,
                        total: total.trim()
                    });
                }
            });

            // Extract basket type (from step 1 selections)
            const selectedBasket = document.querySelector('.step-content[data-step="1"] .product-card.selected .product-name');
            if (selectedBasket) {
                cartData.basketType = selectedBasket.textContent.trim();
            }

            // Extract net type (from step 2 selections)
            const selectedNet = document.querySelector('.step-content[data-step="2"] .product-card.selected .product-name');
            if (selectedNet) {
                cartData.netType = selectedNet.textContent.trim();
            }

            // Extract ribbon type (from step 3 selections)
            const selectedRibbon = document.querySelector('.step-content[data-step="3"] .product-card.selected .product-name');
            if (selectedRibbon) {
                cartData.ribbonType = selectedRibbon.textContent.trim();
            }

            // Extract totals
            const subtotalElement = document.querySelector('.cart-subtotal-price');
            if (subtotalElement) {
                cartData.subtotal = subtotalElement.textContent.replace('AED', '').trim();
            }

            const discountElement = document.querySelector('.cart-discount-price');
            if (discountElement) {
                cartData.discount = discountElement.textContent.replace('AED', '').replace('-', '').trim();
            }

            const finalTotalElement = document.querySelector('.cart-total-price');
            if (finalTotalElement) {
                cartData.finalTotal = finalTotalElement.textContent.replace('AED', '').trim();
            }

            // Add item count
            cartData.totalItems = cartData.items.length;
            cartData.totalQuantity = cartData.items.reduce((sum, item) => sum + item.quantity, 0);

            // Convert items array to JSON string for easier storage
            cartData.itemsJson = JSON.stringify(cartData.items);

        } catch (error) {
            console.error('Error extracting cart data:', error);
        }

        return cartData;
    }

    /**
     * Save current cart state to Google Sheets
     */
    async saveCart() {
        const cartData = this.extractCartData();
        
        // Only save if cart has items
        if (cartData.items.length > 0) {
            await this.submitCartToSheets(cartData);
            this.showStatus('Cart saved successfully!', 'success');
        } else {
            this.showStatus('Cart is empty - nothing to save', 'error');
        }
    }

    /**
     * Show status message to user
     * @param {string} message - Status message
     * @param {string} type - Message type: 'success', 'error'
     */
    showStatus(message, type) {
        // Create or update status element
        let statusElement = document.getElementById('cart-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'cart-status';
            statusElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                font-family: 'Nunito', sans-serif;
                font-size: 14px;
                font-weight: bold;
                z-index: 9999;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(statusElement);
        }

        // Set message and styling based on type
        statusElement.textContent = message;
        
        switch (type) {
            case 'success':
                statusElement.style.backgroundColor = '#28a745';
                statusElement.style.color = '#fff';
                break;
            case 'error':
                statusElement.style.backgroundColor = '#dc3545';
                statusElement.style.color = '#fff';
                break;
        }

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (statusElement && statusElement.parentNode) {
                statusElement.parentNode.removeChild(statusElement);
            }
        }, 3000);
    }
}

// Create global instance
window.cartHandler = new CartHandler();