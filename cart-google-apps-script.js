/**
 * Google Apps Script Code for Cart Data Integration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Sheets (sheets.google.com)
 * 2. Create a new spreadsheet called "Cart Orders" or "Basket Orders"
 * 3. Go to Extensions > Apps Script
 * 4. Replace the default code with this code
 * 5. Save the script with name "CartDataScript"
 * 6. Click "Deploy" > "New deployment"
 * 7. Choose "Web app" as type
 * 8. Set execute as "Me" and access to "Anyone"
 * 9. Click "Deploy" and copy the URL
 * 10. Replace YOUR_CART_SCRIPT_URL_HERE in cartHandler.js with the URL you copied
 */

function doPost(e) {
  try {
    console.log('Cart doPost function called');
    console.log('Full event object:', e);
    
    // Check if we have parameters (cart data)
    if (!e || !e.parameter) {
      console.log('No parameters received - this might be a manual test run');
      return ContentService
        .createTextOutput(JSON.stringify({
          'result': 'error',
          'message': 'No cart data received'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Cart parameters received:', e.parameter);
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    console.log('Cart sheet name:', sheet.getName());
    
    // Auto-initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Order Date', 
        'Basket Type',
        'Net Type',
        'Ribbon Type',
        'Total Items',
        'Total Quantity',
        'Subtotal (AED)',
        'Discount (AED)',
        'Final Total (AED)',
        'Items Details (JSON)'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Style the headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      
      console.log('Auto-initialized sheet with headers');
    }
    
    // Parse the cart data
    const cartData = e.parameter;
    
    // Log for debugging
    console.log('Sheet has', sheet.getLastRow(), 'rows');
    console.log('Processed cart data:', cartData);
    
    // Prepare row data for cart orders
    const rowData = [
      cartData.timestamp || new Date().toISOString(),
      cartData.submissionDate || new Date().toLocaleString(),
      cartData.basketType || '',
      cartData.netType || '',
      cartData.ribbonType || '',
      cartData.totalItems || 0,
      cartData.totalQuantity || 0,
      cartData.subtotal || '',
      cartData.discount || '',
      cartData.finalTotal || '',
      cartData.itemsJson || '[]' // JSON string of all items
    ];
    
    // Add the new row
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 11);
    
    // Log the successful submission
    console.log('Cart submission saved:', rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'message': 'Cart data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error
    console.error('Error saving cart data:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS for all requests
function doGet(e) {
  console.log('Cart doGet function called');
  return ContentService
    .createTextOutput(JSON.stringify({
      'result': 'success',
      'message': 'Cart Apps Script is working! Current time: ' + new Date().toLocaleString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to initialize the sheet with headers
function initializeCartSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Add headers if not present
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Order Date', 
      'Basket Type',
      'Net Type',
      'Ribbon Type',
      'Total Items',
      'Total Quantity',
      'Subtotal (AED)',
      'Discount (AED)',
      'Final Total (AED)',
      'Items Details (JSON)'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Style the headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    console.log('Cart sheet initialized with headers');
  }
}

// Test function to add a sample cart order
function addTestCartOrder() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Initialize headers if not present
  initializeCartSheet();
  
  // Add test cart data
  const testCartData = [
    new Date().toISOString(),
    new Date().toLocaleString(),
    'Premium Wicker Basket',
    'Gold Mesh Net',
    'Red Velvet Ribbon',
    5,
    8,
    '250.00',
    '25.00',
    '225.00',
    JSON.stringify([
      { name: 'Premium Dates', quantity: 2, price: '50.00', total: '100.00' },
      { name: 'Mixed Nuts', quantity: 1, price: '75.00', total: '75.00' },
      { name: 'Chocolate Gift Box', quantity: 1, price: '45.00', total: '45.00' }
    ])
  ];
  
  sheet.appendRow(testCartData);
  console.log('Test cart order added successfully');
}

// Function to get all cart orders
function getCartOrders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Convert to array of objects
  if (data.length > 1) {
    const headers = data[0];
    const orders = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      
      // Parse the items JSON if present
      if (obj['Items Details (JSON)']) {
        try {
          obj.items = JSON.parse(obj['Items Details (JSON)']);
        } catch (e) {
          console.log('Error parsing items JSON:', e);
          obj.items = [];
        }
      }
      
      return obj;
    });
    
    return orders;
  }
  
  return [];
}

// Function to get orders by date range
function getOrdersByDateRange(startDate, endDate) {
  const orders = getCartOrders();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return orders.filter(order => {
    const orderDate = new Date(order.Timestamp);
    return orderDate >= start && orderDate <= end;
  });
}

// Function to get total sales summary
function getSalesSummary() {
  const orders = getCartOrders();
  
  const summary = {
    totalOrders: orders.length,
    totalRevenue: 0,
    totalDiscount: 0,
    averageOrderValue: 0,
    topBasketTypes: {},
    topItems: {}
  };
  
  orders.forEach(order => {
    // Calculate revenue
    const finalTotal = parseFloat(order['Final Total (AED)'] || 0);
    const discount = parseFloat(order['Discount (AED)'] || 0);
    
    summary.totalRevenue += finalTotal;
    summary.totalDiscount += discount;
    
    // Count basket types
    const basketType = order['Basket Type'];
    if (basketType) {
      summary.topBasketTypes[basketType] = (summary.topBasketTypes[basketType] || 0) + 1;
    }
    
    // Count items
    if (order.items) {
      order.items.forEach(item => {
        if (item.name) {
          summary.topItems[item.name] = (summary.topItems[item.name] || 0) + (item.quantity || 1);
        }
      });
    }
  });
  
  summary.averageOrderValue = orders.length > 0 ? summary.totalRevenue / orders.length : 0;
  
  return summary;
}