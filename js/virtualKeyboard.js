/**
 * Virtual Keyboard for Kiosk Mode
 * Simple on-screen keyboard for touch interfaces
 */

class VirtualKeyboard {
    constructor() {
        this.activeInput = null;
        this.isVisible = false;
        this.createKeyboard();
    }

    createKeyboard() {
        // Create keyboard container
        this.keyboard = document.createElement('div');
        this.keyboard.id = 'virtual-keyboard';
        this.keyboard.className = 'virtual-keyboard';
        this.keyboard.style.cssText = `
            position: fixed;
            bottom: -400px;
            left: 0;
            right: 0;
            background: #f5f5f5;
            border-top: none;
            padding: 15px 10px;
            z-index: 10000;
            transition: bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            display: none;
            flex-direction: column;
            gap: 5px;
            border-radius: 20px 20px 0 0;
        `;

        document.body.appendChild(this.keyboard);
    }

    createFullKeyboard() {
        // Clear existing keyboard
        this.keyboard.innerHTML = '';

        // Define full keyboard layout (letters only)
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];

        // Create keyboard rows
        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.style.cssText = 'display: flex; justify-content: center; gap: 5px; margin: 1px 0;';
            
            row.forEach(key => {
                const keyButton = this.createKeyButton(key);
                rowDiv.appendChild(keyButton);
            });

            this.keyboard.appendChild(rowDiv);
        });

        // Add space bar and close button row
        const bottomRow = document.createElement('div');
        bottomRow.style.cssText = 'display: flex; justify-content: center; gap: 8px; margin-top: 5px;';

        const spaceBar = document.createElement('button');
        spaceBar.textContent = 'SPACE';
        spaceBar.className = 'virtual-key';
        spaceBar.style.cssText = `
            width: 216px;
            height: 48px;
            border: none;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 25px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #333;
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        spaceBar.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleKeyPress(' ');
        });

        const closeBtn = this.createDoneButton();

        bottomRow.appendChild(spaceBar);
        bottomRow.appendChild(closeBtn);
        this.keyboard.appendChild(bottomRow);
    }

    createNumberPad() {
        // Clear existing keyboard
        this.keyboard.innerHTML = '';

        // Define number pad layout
        const rows = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['0', '-', '⌫']
        ];

        // Create number pad rows
        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.style.cssText = 'display: flex; justify-content: center; gap: 8px; margin: 3px 0;';
            
            row.forEach(key => {
                const keyButton = this.createKeyButton(key, true); // true for number pad styling
                rowDiv.appendChild(keyButton);
            });

            this.keyboard.appendChild(rowDiv);
        });

        // Add done button row
        const bottomRow = document.createElement('div');
        bottomRow.style.cssText = 'display: flex; justify-content: center; margin-top: 8px;';

        const closeBtn = this.createDoneButton();
        bottomRow.appendChild(closeBtn);
        this.keyboard.appendChild(bottomRow);
    }

    createKeyButton(key, isNumberPad = false) {
        const keyButton = document.createElement('button');
        keyButton.textContent = key;
        keyButton.className = 'virtual-key';
        
        const baseSize = isNumberPad ? '60px' : '42px';
        const fontSize = isNumberPad ? '22px' : '17px';
        
        keyButton.style.cssText = `
            min-width: ${baseSize};
            height: ${baseSize};
            border: none;
            background: rgba(255, 255, 255, 0.9);
            border-radius: ${isNumberPad ? '15px' : '12px'};
            font-size: ${fontSize};
            font-weight: 600;
            cursor: pointer;
            user-select: none;
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            color: #333;
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            overflow: hidden;
        `;

        // Special styling for backspace
        if (key === '⌫') {
            keyButton.style.minWidth = isNumberPad ? '72px' : '60px';
            keyButton.style.background = 'linear-gradient(135deg, #555555, #444444)';
            keyButton.style.color = 'white';
        }

        // Ripple effect on click
        keyButton.addEventListener('mousedown', (e) => {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = keyButton.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.6);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.3s ease-out;
                pointer-events: none;
            `;
            
            keyButton.appendChild(ripple);
            
            // Scale and shadow effect
            keyButton.style.transform = 'scale(0.95)';
            if (key === '⌫') {
                keyButton.style.background = 'linear-gradient(135deg, #444444, #333333)'
            } else {
                keyButton.style.background = 'rgba(255, 255, 255, 0.7)';
            }
        });

        keyButton.addEventListener('mouseup', () => {
            keyButton.style.transform = 'scale(1)';
            if (key === '⌫') {
                keyButton.style.background = 'linear-gradient(135deg, #555555, #444444)';
            } else {
                keyButton.style.background = 'rgba(255, 255, 255, 0.9)';
            }
            
            // Remove ripple after animation
            setTimeout(() => {
                const ripples = keyButton.querySelectorAll('span');
                ripples.forEach(ripple => ripple.remove());
            }, 300);
        });

        keyButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleKeyPress(key);
        });

        return keyButton;
    }

    createDoneButton() {
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'DONE';
        closeBtn.style.cssText = `
            width: 120px;
            height: 48px;
            border: none;
            background: linear-gradient(135deg, #555555, #444444);
            color: white;
            border-radius: 27px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            letter-spacing: 0.5px;
        `;
        
        closeBtn.addEventListener('mousedown', () => {
            closeBtn.style.transform = 'scale(0.95)';
            closeBtn.style.background = 'linear-gradient(135deg, #444444, #333333)';
        });
        
        closeBtn.addEventListener('mouseup', () => {
            closeBtn.style.transform = 'scale(1)';
            closeBtn.style.background = 'linear-gradient(135deg, #555555, #444444)';
        });
        
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.hide();
            // Act like Enter key to go to next question
            this.triggerEnterKey();
        });
        return closeBtn;
    }

    handleKeyPress(key) {
        if (!this.activeInput) return;

        if (key === '⌫') {
            // Backspace
            const currentValue = this.activeInput.value;
            this.activeInput.value = currentValue.slice(0, -1);
        } else {
            // Add character
            this.activeInput.value += key;
        }

        // Trigger input event for form validation
        this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    show(inputElement) {
        this.activeInput = inputElement;
        
        // Determine which keyboard to show based on input type and name
        const inputType = inputElement.type;
        const inputName = inputElement.name;
        
        if (inputType === 'tel' || inputType === 'number' || inputName === 'q2' || inputName === 'q3') {
            // Show number pad for phone and basket quantity
            this.createNumberPad();
        } else {
            // Show full keyboard for text inputs (name)
            this.createFullKeyboard();
        }
        
        // Make keyboard visible and animate up
        this.keyboard.style.display = 'flex';
        setTimeout(() => {
            this.keyboard.style.bottom = '0px';
        }, 10);
        
        this.isVisible = true;
        
        // Scroll to make sure input is visible
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    hide() {
        this.keyboard.style.bottom = '-400px';
        this.isVisible = false;
        this.activeInput = null;
        
        // Completely hide keyboard after animation
        setTimeout(() => {
            if (!this.isVisible) {
                this.keyboard.style.display = 'none';
            }
        }, 300); // Match the transition duration
    }

    triggerEnterKey() {
        // Simulate Enter key press to advance to next question
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
        });
        document.dispatchEvent(enterEvent);
    }

    setupInputListeners() {
        // Add click listeners to text, tel, and number inputs
        const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.preventDefault();
                this.show(input);
            });

            // Prevent physical keyboard from showing on mobile
            input.setAttribute('readonly', 'true');
            input.style.cursor = 'pointer';
        });

        // Hide keyboard when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isVisible && 
                !this.keyboard.contains(e.target) && 
                !e.target.matches('input[type="text"], input[type="tel"], input[type="number"]')) {
                this.hide();
            }
        });
    }
}

// Initialize virtual keyboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.virtualKeyboard = new VirtualKeyboard();
    window.virtualKeyboard.setupInputListeners();
});