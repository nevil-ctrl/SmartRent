# SmartRent - Decentralized Property Rental Platform

A full-stack decentralized application (dApp) for property rental on Polygon blockchain with minimal gas fees. Built with React, TypeScript, Solidity, and IPFS.

## 🚀 Features

### MVP Features
- **Property Listings**: Create and manage property listings with IPFS metadata
- **Rental Escrow**: Secure deposit and payment system using smart contracts
- **PDF Contracts**: Generate and sign rental agreements with MetaMask
- **Dispute Resolution**: Decentralized arbitration system for conflict resolution
- **Reputation System**: On-chain reputation and review system
- **MetaMask Integration**: Seamless wallet connection and transaction signing

### Pro Features
- **Subscription Management**: Pro subscriptions for landlords with premium features
- **Multi-chain Support**: Optimized for Polygon L2 with low gas fees
- **IPFS Storage**: Decentralized storage for documents and images
- **Smart Contract Security**: ReentrancyGuard, AccessControl, and best practices

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── MetaMask Integration
├── IPFS File Storage
├── PDF Generation & Signing
└── Smart Contract Interaction

Smart Contracts (Solidity)
├── ListingRegistry - Property listings
├── RentalEscrow - Payment & deposit management
├── Arbitration - Dispute resolution
├── SubscriptionManager - Pro features
├── Reputation - User ratings & reviews
└── SmartRent - Main integration contract

Storage
├── IPFS - Images, documents, metadata
└── Blockchain - Critical data & transactions
```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Solidity, Hardhat, ethers.js
- **Storage**: IPFS (Pinata)
- **PDF**: jsPDF
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- MetaMask wallet
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd SmartRent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local` file in the root directory:
```env
# IPFS Configuration
VITE_IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
VITE_IPFS_API_URL=https://api.pinata.cloud

# Pinata API Keys (get from https://pinata.cloud)
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here

# Contract Addresses (update after deployment)
VITE_SMART_RENT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

### 4. Deploy Smart Contracts

#### Deploy to Mumbai Testnet
```bash
# Set up environment variables
export MUMBAI_RPC_URL="https://rpc-mumbai.maticvigil.com"
export PRIVATE_KEY="your_private_key_here"
export POLYGONSCAN_API_KEY="your_polygonscan_api_key"

# Deploy contracts
npm run deploy:mumbai
```

#### Deploy to Polygon Mainnet
```bash
# Set up environment variables
export POLYGON_RPC_URL="https://polygon-rpc.com"
export PRIVATE_KEY="your_private_key_here"
export POLYGONSCAN_API_KEY="your_polygonscan_api_key"

# Deploy contracts
npm run deploy:polygon
```

### 5. Update Contract Addresses
After deployment, update the contract addresses in:
- `src/hooks/useContracts.ts`
- `.env.local` file

### 6. Start Development Server
```bash
npm run dev
```

## 🧪 Testing

Run smart contract tests:
```bash
npm run test
```

## 📱 Usage

### For Landlords
1. Connect MetaMask wallet
2. Switch to Polygon/Mumbai network
3. Click "List Your Property"
4. Fill property details and upload images
5. Set daily rate and security deposit
6. Submit listing (requires MATIC for gas)

### For Tenants
1. Browse available properties
2. Click "Rent Now" on desired property
3. Review rental terms
4. Make deposit payment
5. Sign rental contract
6. Complete rental process

### For Arbitrators
1. Register as arbitrator
2. Review assigned disputes
3. Make resolution decisions
4. Earn arbitration fees

## 🔧 Development

### Project Structure
```
SmartRent/
├── contracts/          # Smart contracts
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom hooks
│   └── App.tsx        # Main app component
├── test/              # Test files
├── scripts/           # Deployment scripts
└── artifacts/         # Deployment artifacts
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run smart contract tests
- `npm run compile` - Compile smart contracts
- `npm run deploy:mumbai` - Deploy to Mumbai testnet
- `npm run deploy:polygon` - Deploy to Polygon mainnet

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **AccessControl**: Role-based permissions
- **Checks-Effects-Interactions**: Safe state management
- **Input Validation**: Comprehensive parameter validation
- **Emergency Pause**: Admin can pause contracts if needed

## 💰 Gas Optimization

- Optimized for Polygon L2 (low gas fees)
- Efficient storage patterns
- Batch operations where possible
- Minimal external calls

## 🌐 IPFS Integration

- Property images stored on IPFS
- PDF contracts pinned to IPFS
- Metadata stored as JSON on IPFS
- Automatic pinning for persistence

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check documentation
- Join our community

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-token support
- [ ] Integration with other L2s
- [ ] DAO governance
- [ ] NFT property certificates

---

Built with ❤️ for the decentralized future of real estate rental.