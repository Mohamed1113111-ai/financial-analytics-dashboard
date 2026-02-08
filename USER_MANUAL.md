# User Manual: Financial Analytics Dashboard
## View Details Buttons & Customer Modal Guide

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Links Section](#quick-links-section)
3. [View Details Buttons](#view-details-buttons)
4. [Customer Details Modal](#customer-details-modal)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The Financial Analytics Dashboard provides quick access to three main financial analysis views through the **View Details buttons** on the Home page. Additionally, the **AR Forecast page** includes an interactive **Customer Details Modal** that displays comprehensive account information for each customer.

This manual explains how to use these features effectively to manage your financial data and customer accounts.

---

## Quick Links Section

### Location

The Quick Links section appears at the bottom of the **Financial Dashboard** (Home page). It contains three cards with **View Details** buttons:

1. **AR Forecast** - View collection forecasts and aging analysis
2. **Cash Flow** - Analyze cash flow statements and scenarios
3. **P&L Analysis** - Review profitability and variance analysis

### What You'll See

Each Quick Link card displays:
- A descriptive title
- A brief explanation of the section's purpose
- A **View Details** button (highlighted in yellow with dashed border)

---

## View Details Buttons

### How to Use

**Step 1:** Navigate to the Home page (Dashboard)

**Step 2:** Scroll down to the "Quick Links" section at the bottom

**Step 3:** Click the **View Details** button on any of the three cards:
- **AR Forecast** - To view collection forecasts and aging bucket analysis
- **Cash Flow** - To analyze cash flow statements and scenarios
- **P&L Analysis** - To review profitability metrics and variance analysis

**Step 4:** You will be automatically taken to the corresponding dashboard page

### What Happens

When you click a **View Details** button:
- The page smoothly navigates to the selected dashboard
- The sidebar menu highlights the active section
- All relevant data and charts load for that specific analysis
- You can use the browser back button to return to the Home page

### Navigation Tips

| Button | Destination | Key Features |
|--------|-------------|--------------|
| **AR Forecast** | `/ar-forecast` | Collection forecasts, aging analysis, top customers, strategy simulator |
| **Cash Flow** | `/cash-flow` | Cash flow statement, waterfall chart, forecast scenarios, components breakdown |
| **P&L Analysis** | `/pl-analysis` | Income statement, variance analysis, trends, profit breakdown |

---

## Customer Details Modal

### Accessing the Modal

**Step 1:** Navigate to the **AR Forecast** page (use View Details button or sidebar menu)

**Step 2:** Click the **"Top Customers"** tab at the top of the page

**Step 3:** You will see a list of customers with their AR balances and status

**Step 4:** Click on any customer row to open the **Customer Details Modal**

### Modal Contents

The Customer Details Modal displays comprehensive information about a selected customer:

#### Customer Header
- **Customer Name** - The name of the selected customer
- **Section Title** - "Customer AR Account Details"

#### Key Metrics (Displayed in colored boxes)

| Metric | Description | Color |
|--------|-------------|-------|
| **Total AR Balance** | Total outstanding accounts receivable amount | Blue |
| **Days Outstanding** | Average number of days the account has been outstanding | Yellow |
| **Status** | Current collection status (GOOD, AT-RISK, OVERDUE) | Pink/Purple |

#### AR Trend (30-day)
- Shows the percentage change in AR balance over the last 30 days
- **Green arrow** = Improvement (balance decreasing)
- **Red arrow** = Deterioration (balance increasing)

#### Recommended Actions
A list of context-aware recommendations based on the customer's status:
- For **GOOD** status customers: Monitor payment patterns, consider early payment discounts
- For **AT-RISK** customers: Increase collection efforts, review credit terms
- For **OVERDUE** customers: Immediate escalation, legal review if necessary

### Modal Buttons

#### Close Button
- **Location:** Bottom left of the modal
- **Function:** Closes the modal and returns to the customer list
- **Keyboard:** Press ESC to close

#### Send Payment Reminder Button
- **Location:** Bottom right of the modal (blue button)
- **Function:** Sends a payment reminder notification to the customer
- **Status:** Displays confirmation when successfully sent

---

## Common Tasks

### Task 1: Check AR Forecast for a Specific Customer

**Objective:** View detailed AR information for a customer

**Steps:**
1. Click **View Details** on the AR Forecast Quick Link card
2. Click the **"Top Customers"** tab
3. Locate the customer in the list
4. Click on the customer row to open the modal
5. Review the Total AR Balance, Days Outstanding, and Status
6. Check the AR Trend to see if the balance is improving or deteriorating

**Result:** You now have a complete picture of the customer's AR status

---

### Task 2: Monitor Collection Status

**Objective:** Identify customers requiring immediate attention

**Steps:**
1. Go to AR Forecast page
2. Click **"Top Customers"** tab
3. Look for customers with:
   - Status badge showing **"AT-RISK"** (yellow/orange)
   - Status badge showing **"OVERDUE"** (red)
   - High Days Outstanding values (>60 days)
4. Click on each at-risk customer to open their modal
5. Review the Recommended Actions for collection strategies

**Result:** You've identified priority customers for collection efforts

---

### Task 3: Send Payment Reminder to a Customer

**Objective:** Notify a customer about their outstanding balance

**Steps:**
1. Navigate to AR Forecast → Top Customers tab
2. Find the customer you want to remind
3. Click on the customer row to open the modal
4. Review the customer's AR details
5. Click the **"Send Payment Reminder"** button (blue button at bottom right)
6. Wait for the confirmation message
7. Click **"Close"** to return to the customer list

**Result:** A payment reminder has been sent to the customer

---

### Task 4: Track AR Trend for a Customer

**Objective:** Monitor whether a customer's AR balance is improving

**Steps:**
1. Open AR Forecast page
2. Go to Top Customers tab
3. Click on the customer to open their modal
4. Look at the **"AR Trend (30-day)"** section
5. Check the percentage and arrow direction:
   - **Green arrow with positive %** = Balance decreasing (good)
   - **Red arrow with negative %** = Balance increasing (concerning)

**Result:** You understand the customer's AR trajectory

---

### Task 5: Navigate Between Different Dashboards

**Objective:** Compare financial metrics across different analysis views

**Steps:**
1. Start on Home page
2. Click **View Details** on AR Forecast card
3. Review AR metrics
4. Go back to Home page (click Dashboard in sidebar or use browser back)
5. Click **View Details** on Cash Flow card
6. Review cash flow metrics
7. Return to Home page
8. Click **View Details** on P&L Analysis card
9. Review profitability metrics

**Result:** You've reviewed all three key financial areas

---

## Troubleshooting

### Issue: View Details Button Not Responding

**Problem:** Clicking a View Details button doesn't navigate to the dashboard

**Solutions:**
1. **Refresh the page** - Press F5 or Ctrl+R
2. **Check your internet connection** - Ensure you have stable connectivity
3. **Clear browser cache** - Clear cookies and cached data
4. **Try a different browser** - Test if the issue is browser-specific
5. **Wait a moment** - Large data loads may take a few seconds

**If issue persists:** Contact your system administrator

---

### Issue: Customer Modal Not Opening

**Problem:** Clicking on a customer row doesn't open the modal

**Solutions:**
1. **Ensure you're on the Top Customers tab** - Check that the "Top Customers" tab is selected
2. **Verify the customer row is clickable** - The entire row should be clickable, not just specific text
3. **Refresh the page** - Reload the AR Forecast page
4. **Check for browser errors** - Open browser developer tools (F12) and check the console for errors

**If issue persists:** Contact your system administrator

---

### Issue: Payment Reminder Button Not Working

**Problem:** Clicking "Send Payment Reminder" doesn't send the reminder

**Solutions:**
1. **Check your internet connection** - Ensure stable connectivity
2. **Verify customer email is configured** - The customer must have a valid email address on file
3. **Wait for confirmation** - The system may take a few seconds to process
4. **Try again** - Sometimes temporary network issues cause failures
5. **Check notification settings** - Verify that notifications are enabled in system settings

**If issue persists:** Contact your system administrator

---

### Issue: Modal Displays Incorrect Data

**Problem:** The customer details shown don't match what you expect

**Solutions:**
1. **Refresh the page** - Data may not have loaded correctly
2. **Check the date range filter** - Verify the selected date range at the top of the page
3. **Check the location filter** - Ensure the correct location is selected
4. **Verify customer selection** - Make sure you clicked on the correct customer row

**If issue persists:** The data may need to be updated in the system. Contact your system administrator

---

### Issue: Sidebar Navigation Not Working

**Problem:** Clicking sidebar menu items doesn't navigate

**Solutions:**
1. **Use View Details buttons instead** - Navigate via the Quick Links buttons on Home page
2. **Use browser back/forward buttons** - Navigate using browser controls
3. **Refresh the page** - Reload the dashboard
4. **Check for JavaScript errors** - Open browser console (F12) to check for errors

**If issue persists:** Contact your system administrator

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **ESC** | Close the Customer Details Modal |
| **F5** | Refresh the current page |
| **Ctrl+R** | Refresh the current page |
| **Alt+Left Arrow** | Go back to previous page |
| **Alt+Right Arrow** | Go forward to next page |

---

## Best Practices

### For Effective AR Management

1. **Review Top Customers Weekly** - Check the Top Customers list at least once a week to identify trends
2. **Act on AT-RISK Status** - Don't wait for customers to become OVERDUE; take action when status is AT-RISK
3. **Monitor AR Trends** - Watch for customers whose AR balance is consistently increasing
4. **Send Reminders Proactively** - Use the Send Payment Reminder feature before accounts become overdue
5. **Document Actions** - Keep notes of which customers you've contacted and their responses

### For Dashboard Navigation

1. **Use View Details Buttons** - They're the fastest way to access specific dashboards
2. **Bookmark Important Pages** - Save URLs for frequently accessed dashboards
3. **Use Date Range Filters** - Adjust the date range at the top to focus on specific periods
4. **Use Location Filters** - Filter by location to analyze specific branches or regions
5. **Export Data** - Use the Export button to download data for further analysis

---

## Frequently Asked Questions (FAQ)

**Q: Can I edit customer information from the modal?**
A: No, the modal is read-only. To edit customer information, use the Customers section in the sidebar.

**Q: How often is the customer data updated?**
A: Customer data is updated in real-time as transactions are processed. Some aggregated metrics (like AR Trend) are calculated daily.

**Q: Can I send reminders to multiple customers at once?**
A: Currently, you must send reminders individually. For bulk operations, contact your system administrator.

**Q: What does "Days Outstanding" mean?**
A: It's the average number of days since the invoice was issued that remains unpaid.

**Q: How is the status (GOOD/AT-RISK/OVERDUE) determined?**
A: Status is based on Days Outstanding: GOOD (<30 days), AT-RISK (30-60 days), OVERDUE (>60 days).

**Q: Can I filter the Top Customers list?**
A: Yes, use the date range and location filters at the top of the page to filter the data.

**Q: What happens after I send a payment reminder?**
A: The system sends an email notification to the customer's registered email address. A confirmation message appears in the modal.

---

## Support & Contact

If you encounter any issues not covered in this manual:

1. **Check the Troubleshooting section** - Most common issues are documented above
2. **Contact your System Administrator** - They can help with technical issues
3. **Provide detailed information** - When reporting issues, include:
   - What you were trying to do
   - What happened instead
   - Any error messages you saw
   - Your browser and operating system

---

## Version Information

- **Manual Version:** 1.0
- **Last Updated:** February 2026
- **Dashboard Version:** 1.0
- **Compatible Browsers:** Chrome, Firefox, Safari, Edge (latest versions)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial manual creation with View Details buttons and Customer Modal documentation |

---

**End of User Manual**

For the latest updates and additional resources, visit your dashboard's Help section.
