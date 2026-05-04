# Finance Dashboard - Spend Analyzer

A financial dashboard application built with Angular that analyzes spending patterns from bank statements and Excel files.

## Features

- **Spend Analyzer Dashboard**: Upload bank statements (Excel/CSV) to automatically categorize and visualize spending
- **Automatic Categorization**: Smart categorization of transactions (Groceries, Dining, Transportation, etc.)
- **Visual Analytics**: Pie charts and bar charts for spending breakdown
- **Summary Cards**: Total income, spending, and net balance
- **Transaction Tables**: Detailed view of all transactions with category breakdown

## Getting Started

### Development Server

```bash
cd finance-dashboard
npm install
ng serve
```

Navigate to `http://localhost:4200/`

### Build for Production

```bash
ng build --configuration production
```

Build artifacts will be in `dist/finance-dashboard/browser/`

## Deployment Options

### 1. AWS S3 + CloudFront (Recommended)

```bash
# Build the app
ng build --configuration production

# Install AWS CLI if not already installed
# Configure AWS credentials: aws configure

# Create S3 bucket
aws s3 mb s3://your-finance-dashboard

# Upload files
aws s3 sync dist/finance-dashboard/browser/ s3://your-finance-dashboard --delete

# Enable static website hosting
aws s3 website s3://your-finance-dashboard --index-document index.html --error-document index.html

# Create CloudFront distribution for HTTPS and CDN
```

### 2. Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
ng build --configuration production
netlify deploy --prod --dir=dist/finance-dashboard/browser
```

### 3. Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 4. Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
ng build --configuration production
firebase deploy
```

## Excel File Format

Your bank statement Excel file should have these columns:
- **Date**: Transaction date
- **Description**: Transaction description
- **Amount**: Negative for debits (spending), positive for credits (income)

See `SAMPLE_DATA.md` for example format.

## Future Enhancements

- Multiple dashboard types (Investment Portfolio, Budget Tracker)
- Export reports to PDF
- Monthly/Yearly comparisons
- Budget goals and alerts
- Connect to bank APIs

## 1.🏠Dashboard Overview
![image alt](https://github.com/alexsteven311-design/finance-dashboard/blob/7823c36a85d0e1754410a3c25af9b8bf3d033ea3/Screenshot%202026-03-10%20114933.png)
## How it works :
- Monthly income & expense summary
- Net savings tracking
- Financial health score
- Market insights (RBI trends, sector updates, etc.)

## 2.📊Spend Analyzer
![image alt](https://github.com/alexsteven311-design/finance-dashboard/blob/04e97d22f0837fda9e0bc75836baadc6c57244d5/Screenshot_28-4-2026_161513_localhost.jpeg)
## How it works :
- Upload bank statements (CSV/Excel) to automatically analyze expenses
- AI-powered insights highlight unusual spending patterns
- Category-wise breakdown (Housing, Groceries, Food, etc.)
- Visual analytics with pie charts & bar graphs
- Real-time alerts like:
- ⚠️ High spending categories (e.g., Housing = 42.9%)

 ## Insights from your dashboard:

- Total Income: ₹40,000
- Total Spending: ₹23,327
- Net Balance: ₹16,673
- Major expense: Housing & Loans (42.9%)

## 3.📈Investment Tracker
![image alt](https://github.com/alexsteven311-design/finance-dashboard/blob/37cd6883529aefddaffed9820743ed5f8932acf1/Screenshot_28-4-2026_161843_localhost.jpeg)
## How it works :
- rack all investments in one place
Monitor:
- Total Invested: ₹155,000
- Current Value: ₹184,100
- Returns: ₹29,100 (+18.8%)
- Portfolio allocation across:
- Equity, Debt, Gold, Crypto
- Performance comparison across assets
- Smart Buy / Hold signals based on returns & trends

Top Performers:

- HDFC Equity Fund: +24%
- Infosys Stock: +20%
- Bitcoin: +23.3%

 ## 🤖 3. AI Decision Signals
 ![image alt](https://github.com/alexsteven311-design/finance-dashboard/blob/11c9240d7648ef8ab00ae11f2282505d04b11459/Screenshot_28-4-2026_162849_localhost.jpeg)
## How it works :
- Intelligent recommendations for each investment
- Signals based on:
- Returns %
- Market trends
- Portfolio diversification

Examples:

✅ BUY: Strong momentum (Equity funds, Stocks)
⚖️ HOLD: Uncertain or volatile assets (Crypto)
📊 Suggests SIP or allocation changes

## 🎯4.Investment Planning
![image alt](https://github.com/alexsteven311-design/finance-dashboard/blob/cb5278b9dedbb626bc365e7c7fe8960cf991d5a5/Screenshot_28-4-2026_163440_localhost.jpeg)
## How it works :
- Set financial goals (e.g., Retirement Fund)
- Input:
  - Target amount
  - Current savings
  - Time horizon
  - Risk tolerance
  - Generates a personalized plan
 
  
