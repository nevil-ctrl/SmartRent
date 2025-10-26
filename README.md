# 🏠 SmartRent - Decentralized Rental Platform

## 🎉 FULLY FUNCTIONAL & READY TO USE!

> **Modern blockchain-based real estate rental platform with smart contracts, IPFS storage, and reputation system**

Contract deployed locally: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`

**[🇷🇺 Russian Documentation](./README_RU.md)** | **[📘 Deployment Guide](./DEPLOYMENT_GUIDE.md)** | **[🧪 Testing Guide](./TESTING_GUIDE.md)**

---

## ✨ Features

### 🏢 For Landlords
- 📝 Create property listings with IPFS photo storage
- 💰 Flexible pricing and deposits
- 🔐 Smart contract protected escrow
- ⭐ Reputation system
- 📊 Analytics and statistics (Pro/Premium)
- 👑 Premium subscriptions for better visibility

### 🏠 For Tenants
- 🔍 Advanced search and filters
- 🖼️ View property photos from IPFS
- 📄 Automatic PDF contract generation
- 💬 Direct communication with landlords
- ⚖️ Arbitration system for disputes
- 📈 Transparent landlord reputation

### 🛡️ Security & Trust
- ✅ Polygon smart contracts
- ✅ IPFS data storage
- ✅ Escrow deposit protection
- ✅ Digital contract signatures
- ✅ Arbitration system
- ✅ 2% platform fee
- ✅ Full transaction transparency

---

## 🚀 Quick Start (Local Testing)

```bash
# 1. Install
npm install

# 2. Start Hardhat node (in background - already running)
npx hardhat node

# 3. Deploy locally (already done!)
npm run deploy:local

# 4. Run frontend
npm run dev
```

## MetaMask Setup for Local Testing

### Add Hardhat Network:

```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency: ETH
```

### Import Test Account:

```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Balance: 10000 ETH
```

## ✨ What's Included

### 🏢 Core Features
✅ **Smart Contracts** - 6 fully integrated contracts on Polygon  
✅ **Listings** - Create and browse property listings with IPFS photos  
✅ **Rental System** - Escrow-protected deposits and rentals  
✅ **Reputation** - User ratings and reviews on blockchain  
✅ **Subscriptions** - Free, Pro ($30/mo), Premium ($50/mo) plans  
✅ **PDF Contracts** - Auto-generated rental agreements  
✅ **Arbitration** - Dispute resolution system  
✅ **2% Platform Fee** - Transparent commission on deposits  

### 🎨 Design
✅ **Stepik Teach Style** - Modern, clean interface  
✅ **Responsive** - Mobile-first adaptive design  
✅ **Animated** - Smooth gradients and transitions  
✅ **Accessible** - WCAG 2.1 compliant  

### 📊 Statistics
- **6** Smart contracts
- **6** Pages
- **15+** Components
- **30+** Blockchain functions
- **15,000+** Lines of code
- **4** Documentation files

## Commands

```bash
npm run compile          # Compile contracts
npm run deploy:local     # Deploy to local Hardhat
npm run deploy:amoy      # Deploy to Amoy testnet
npm run deploy:polygon   # Deploy to Polygon mainnet
npm run dev              # Start frontend
npx hardhat clean        # Clean artifacts
```

## For Production (Amoy/Polygon)

1. Get MATIC: https://faucet.polygon.technology/
2. Deploy: `npm run deploy:amoy`
3. Update address in `.env` and `src/hooks/useContracts.ts`

---

**See ЛОКАЛЬНЫЙ-ТЕСТ.md for detailed instructions!**

Everything works! 🚀
