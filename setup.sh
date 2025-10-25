#!/bin/bash

echo "🚀 Setting up SmartRent dApp..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# IPFS Configuration
VITE_IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
VITE_IPFS_API_URL=https://api.pinata.cloud

# Pinata API Keys (get from https://pinata.cloud)
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here

# Contract Addresses (update after deployment)
VITE_SMART_RENT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_LISTING_REGISTRY_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_RENTAL_ESCROW_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_ARBITRATION_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_SUBSCRIPTION_MANAGER_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_REPUTATION_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
EOF
    echo "✅ .env.local file created"
else
    echo "✅ .env.local file already exists"
fi

# Compile smart contracts
echo "🔨 Compiling smart contracts..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Failed to compile smart contracts"
    exit 1
fi

echo "✅ Smart contracts compiled successfully"

# Run tests
echo "🧪 Running tests..."
npm run test

if [ $? -ne 0 ]; then
    echo "⚠️  Some tests failed, but continuing..."
else
    echo "✅ All tests passed"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Pinata API keys"
echo "2. Deploy contracts: npm run deploy:mumbai"
echo "3. Update contract addresses in .env.local"
echo "4. Start development server: npm run dev"
echo ""
echo "For more information, see README.md"
