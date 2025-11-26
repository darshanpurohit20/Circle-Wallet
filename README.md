
## Circle-Wallet – Prepaid Shared Wallet with Smart Splitting

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
   npm run dev
   ```

## License  
MIT

***
<img width="1470" height="885" alt="image" src="https://github.com/user-attachments/assets/f775d3da-cd27-4c40-9a80-70669e29f9d2" />

<img width="1470" height="847" alt="image" src="https://github.com/user-attachments/assets/7dfac42c-23cb-4137-96bb-ddee95cf76cb" />

<img width="1470" height="887" alt="image" src="https://github.com/user-attachments/assets/fc047ac0-2b25-414e-9d4c-c10cf3816360" />

<img width="1470" height="836" alt="image" src="https://github.com/user-attachments/assets/57f4db15-5899-47d3-9780-45f6bce9f32a" />

<img width="1462" height="872" alt="image" src="https://github.com/user-attachments/assets/840f3902-0f31-4afc-a6d4-65933db35f0c" />

<img width="1470" height="884" alt="image" src="https://github.com/user-attachments/assets/4c6eb6c4-34ae-4d08-beb0-dcd41b86bde4" />

<img width="797" height="652" alt="image" src="https://github.com/user-attachments/assets/a378aeae-cda3-4d4c-b572-4c2b6306e7fb" />

<img width="1470" height="844" alt="image" src="https://github.com/user-attachments/assets/8b18edbc-255c-4730-bba9-1658774f5689" />

<img width="1470" height="878" alt="image" src="https://github.com/user-attachments/assets/cde664ce-a544-4492-ae6e-ab556b1d1953" />




