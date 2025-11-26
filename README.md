
# Circle-Wallet – Prepaid Shared Wallet with Smart Splitting

**Problem Statement ID:** AVS321  
**Theme:** Digital empowerment for rural communities

## Overview

This project addresses the challenges of group expense management during trips, specifically for rural families and communities. Traditional expense apps (like Splitwise) act retroactively and fail with complex participant structures (e.g., different family sizes, uneven alcohol consumption, etc.). Our solution is a **dynamic “Group Wallet” system**—a mobile/web application offering real-time, automated expense splitting via a prepaid shared wallet.

## Features

- **Prepaid Wallet:**  
  All users contribute a chosen amount to a central digital wallet before the trip.

- **Real-Time Payment:**  
  Pay merchants directly via UPI/Card through the app interface.

- **Instant Smart Splitting:**  
  At the time of payment, select “Who participated?” and instantly split the expense:
    - Handles complex scenarios:  
    - Mixed groups (families, couples, singles)
    - Custom ratios (per-family, per-person, etc.)
    - Handles exclusions (e.g., certain members not participating in a specific expense)

- **Automated Deductions:**  
  Correct weighted amounts auto-deducted from individual balances, reflecting custom participation.

- **Member Management:**  
  Manage families and individuals, assign ratios/shares.

- **Transaction History & Reporting:**  
  Track all deposits, payments, and balances per member & group.

## Screenshots

- Members & Families dashboard  
- Transaction log (deposits/payments)  
- Group wallet overview  
- Merchant payment with live split-previews  
 *(See attached screenshots)*

## How it works

1. **Setup:**  
   - Create group, add families/persons, assign initial contributions.
   - Pool funds into shared wallet.

2. **Making a Payment:**  
   - Select merchant, enter amount, choose category (e.g., food, drinks).
   - Specify involved participants (tick/untick, split by family/adults/kids/custom).
   - App calculates and deducts correct share per participant instantly.

3. **Tracking & Reporting:**  
   - View remaining balances, transaction history, pending payments/requests.

## Tech Stack

- React/React Native front-end (example UI)
- Backend: Node.js/Express, MongoDB (or Firebase)
- Payment APIs: UPI integration / payment sandbox
- Responsive, modern UI (see screenshots)

## Problem Solved

- Empowers rural and family groups to manage expenses transparently and equitably
- Reduces calculation headaches and disputes—logic is handled automatically
- Enables digital inclusion (UPI-centric, mobile-friendly interface)

## Getting Started

1. Clone repo
2. Install dependencies
3. Add environment config for payment API
4. Run locally:  
   ```bash
   npm install  
   npm start
   ```

## License  
MIT

***
<img width="1370" height="812" alt="Screenshot 2025-11-26 at 1 07 36 AM" src="https://github.com/user-attachments/assets/1ce097d4-cac2-49f1-a311-c9ff56fa9dc4" /> <img width="1424" height="816" alt="Screenshot 2025-11-26 at 1 14 49 AM" src="https://github.com/user-attachments/assets/7d6df845-6a6a-48c2-a80d-c4c49f9111c0" />
<img width="1465" height="827" alt="Screenshot 2025-11-26 at 1 15 07 AM" src="https://github.com/user-attachments/assets/5f53d9de-170a-43dc-8f86-1c2c0c737562" /> <img width="1465" height="822" alt="Screenshot 2025-11-26 at 1 15 28 AM" src="https://github.com/user-attachments/assets/6ff4974a-5078-4fdc-9342-941c1a7a3940" />





