# SmartRent - Decentralized Rental Platform

## 🎉 READY TO USE!

Contract deployed locally: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`

## Quick Start (Local Testing)

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

## What Works

✅ Smart contract deployed locally  
✅ Search & filtering (real-time)  
✅ Create listings with IPFS  
✅ Reputation system  
✅ Platform statistics  
✅ All 6 contracts working

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
