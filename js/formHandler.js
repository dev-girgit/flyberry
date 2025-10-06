/**
 * Form Handler for Google Sheets Integration
 * Automatically saves form data to Google Sheets
 */

class FormHandler {
    constructor() {
        // Connected to BYOB Google Sheet - Updated URL
        this.scriptURL = 'https://script.google.com/macros/s/AKfycbySmX4PetHSOf1zla-99sdfOjSibwTTaqHNxOujnsS2oNuGOXZB3zsr7ofpT8bQo0V-/exec';
        this.isSubmitting = false;
    }

    /**
     * Collect form data and send to Google Sheets
     * @param {HTMLFormElement} form - The form element
     */
    async submitToSheets(form) {
        if (this.isSubmitting) return;
        
        try {
            this.isSubmitting = true;
            // Silent background processing - no UI messages

            // Collect form data
            const formData = this.collectFormData(form);
            console.log('Form data collected:', formData);
            
            // Create a form and submit it (this avoids CORS issues)
            const submitForm = document.createElement('form');
            submitForm.action = this.scriptURL;
            submitForm.method = 'POST';
            submitForm.target = 'hidden_iframe';
            submitForm.style.display = 'none';

            // Add form data as hidden inputs
            for (const [key, value] of Object.entries(formData)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                submitForm.appendChild(input);
            }

            // Create hidden iframe to capture response
            let iframe = document.getElementById('hidden_iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.name = 'hidden_iframe';
                iframe.id = 'hidden_iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            // Handle iframe load (success) - Silent background processing
            iframe.onload = () => {
                console.log('Iframe loaded - submission complete');
                console.log('Form data sent to Google Sheets:', formData);
                this.isSubmitting = false;
                
                // Clean up
                if (submitForm.parentNode) {
                    submitForm.parentNode.removeChild(submitForm);
                }
            };

            // Handle iframe error - Silent background processing
            iframe.onerror = () => {
                console.error('Iframe error - submission failed');
                this.isSubmitting = false;
            };

            // Submit the form
            document.body.appendChild(submitForm);
            console.log('Submitting form to:', this.scriptURL);
            submitForm.submit();

            // Add timeout in case iframe doesn't respond
            setTimeout(() => {
                if (this.isSubmitting) {
                    console.log('Submission timeout - assuming success');
                    this.isSubmitting = false;
                    
                    if (submitForm.parentNode) {
                        submitForm.parentNode.removeChild(submitForm);
                    }
                }
            }, 5000); // 5 second timeout

        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            this.isSubmitting = false;
        }
    }

    /**
     * Collect all form data into an object
     * @param {HTMLFormElement} form - The form element
     * @returns {Object} Form data object
     */
    collectFormData(form) {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.name && input.value) {
                formData[input.name] = input.value;
            }
        });

        // Add timestamp
        formData.timestamp = new Date().toISOString();
        formData.submissionDate = new Date().toLocaleString();

        return formData;
    }

    /**
     * Show status message to user
     * @param {string} message - Status message
     * @param {string} type - Message type: 'loading', 'success', 'error'
     */
    showStatus(message, type) {
        // Create or update status element
        let statusElement = document.getElementById('submission-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'submission-status';
            statusElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: bold;
                z-index: 9999;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusElement);
        }

        // Set message and styling based on type
        statusElement.textContent = message;
        
        switch (type) {
            case 'loading':
                statusElement.style.backgroundColor = '#f0ad4e';
                statusElement.style.color = '#fff';
                break;
            case 'success':
                statusElement.style.backgroundColor = '#5cb85c';
                statusElement.style.color = '#fff';
                break;
            case 'error':
                statusElement.style.backgroundColor = '#d9534f';
                statusElement.style.color = '#fff';
                break;
        }

        // Auto-hide after 3 seconds for success/error messages
        if (type !== 'loading') {
            setTimeout(() => {
                if (statusElement && statusElement.parentNode) {
                    statusElement.parentNode.removeChild(statusElement);
                }
            }, 3000);
        }
    }


}

// Create global instance
window.formHandler = new FormHandler();