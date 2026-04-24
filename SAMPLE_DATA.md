# Sample Bank Statement Format

Your CSV file has been analyzed. The app now supports the following format:

## CSV Column Structure:
- **Date**: Transaction date (DD/MM/YY format)
- **Narration**: Transaction description (UPI payments, transfers, etc.)
- **Value Dat**: Value date
- **Debit Amount**: Money spent (debits)
- **Credit Amount**: Money received (credits)
- **Chq/Ref Number**: Reference number
- **Closing Balance**: Account balance after transaction

## Supported Categories:
- **Food & Dining**: Zomato, Swiggy, restaurants, cafes
- **Groceries**: Blinkit, BBNow, BigBasket
- **Shopping**: Amazon, Flipkart, retail stores
- **Transportation**: Uber, Ola, fuel
- **Housing & Loans**: Rent, EMI, loans
- **Utilities**: Electricity, water, internet, bills
- **Entertainment**: Netflix, Spotify, Prime
- **Healthcare**: Pharmacies, hospitals, medical
- **Education**: College fees, school fees
- **Bank Charges**: ACH, bank fees
- **UPI Transfers**: Person-to-person transfers
- **Income**: Salary, income deposits
- **Other**: Uncategorized transactions

## How to Use:
1. Export your bank statement as CSV
2. Upload it to the Spend Analyzer dashboard
3. View automatic categorization and spending analysis

The app automatically handles:
- Indian date format (DD/MM/YY)
- Separate Debit/Credit columns
- UPI transaction descriptions
- Comma-separated amounts
