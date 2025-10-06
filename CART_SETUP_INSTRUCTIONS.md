# Cart Data Google Sheets Integration Setup

## Overview
This system automatically saves cart/basket order data to Google Sheets when users interact with the basket builder. It captures:
- Items added to cart (dates, nuts, chips, etc.)
- Basket type selected
- Net and ribbon choices
- Pricing information (subtotal, discount, final total)
- Timestamps
- Order details in JSON format

## Setup Instructions

### 1. Create a New Google Sheet for Cart Data

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Create" → "Blank spreadsheet"
3. Name it "**Flyberry Cart Orders**" or "**Basket Orders**"
4. The sheet will be automatically formatted by the script

### 2. Set Up Google Apps Script

1. In your new Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any existing code in the script editor
3. Copy and paste the code from `cart-google-apps-script.js` (in your project folder)
4. Save the script with a name like "**CartDataHandler**"

### 3. Deploy the Script

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Cart Data Collector"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Copy the Web App URL** that appears

### 4. Update Your Website

1. Open `js/cartHandler.js` in your project
2. Find the line: `this.scriptURL = 'YOUR_CART_SCRIPT_URL_HERE';`
3. Replace `YOUR_CART_SCRIPT_URL_HERE` with the Web App URL you copied

### 5. Test the Integration

1. Run the `addTestCartOrder()` function in Apps Script:
   - In Apps Script editor, select the function from dropdown
   - Click the ▶️ Run button
   - Authorize the script if prompted
2. Check your Google Sheet - you should see a test order with headers
3. Test from your website by adding items to cart and clicking "Save Order"

## Data Structure

The system saves the following data for each cart/order:

| Column | Description | Example |
|--------|-------------|---------|
| Timestamp | ISO timestamp | 2025-10-06T14:30:00.000Z |
| Order Date | Human-readable date | 10/6/2025, 2:30:00 PM |
| Basket Type | Selected basket | Premium Wicker Basket |
| Net Type | Selected net | Gold Mesh Net |
| Ribbon Type | Selected ribbon | Red Velvet Ribbon |
| Total Items | Number of different items | 5 |
| Total Quantity | Sum of all quantities | 12 |
| Subtotal (AED) | Before discount | 250.00 |
| Discount (AED) | Discount amount | 25.00 |
| Final Total (AED) | After discount | 225.00 |
| Items Details (JSON) | Full item breakdown | [{"name":"Premium Dates","quantity":2,"price":"50.00","total":"100.00"}] |

## Features

### Automatic Saving
- Cart data is automatically saved when users add/remove items
- Uses debounced saving (2-second delay) to avoid excessive requests
- Only saves when cart has items

### Manual Saving
- "Save Order" button in the cart section
- Provides user feedback via status messages
- Works even if auto-save fails

### Data Analysis Functions
Available in Google Apps Script for reporting:

- `getCartOrders()` - Get all orders
- `getOrdersByDateRange(startDate, endDate)` - Filter by date
- `getSalesSummary()` - Get sales analytics
- `initializeCartSheet()` - Set up headers and formatting

## Troubleshooting

### Common Issues

1. **"Cart handler not loaded" error**
   - Ensure `cartHandler.js` is properly included in HTML
   - Check browser console for script loading errors

2. **Data not saving to sheets**
   - Verify the Web App URL is correct in `cartHandler.js`
   - Check that the Apps Script deployment has "Anyone" access
   - Run `addTestCartOrder()` to test Apps Script permissions

3. **CORS errors**
   - The system uses hidden iframe method to avoid CORS
   - Ensure the deployment type is "Web app", not "API executable"

### Testing Tips

1. Use browser Developer Tools Console to see debug messages
2. Test the Apps Script independently using the test functions
3. Check the Google Sheets for data after each test
4. Verify the JSON structure in the "Items Details" column

## Security Notes

- The Web App is set to "Anyone" access for simplicity
- Consider restricting access if handling sensitive data
- All data is stored in your Google account
- No personal payment information is captured

## Next Steps

After setup, you can:
1. Create Google Sheets reports and charts from the order data
2. Set up email notifications for new orders
3. Export data for accounting or inventory management
4. Integrate with other Google Workspace tools

---

**Support**: If you encounter issues, check the browser console for error messages and verify all URLs and permissions are configured correctly.