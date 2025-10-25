@echo off
echo 🚀 Setting up SmartRent dApp...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo 📝 Creating .env.local file...
    (
        echo # IPFS Configuration
        echo VITE_IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
        echo VITE_IPFS_API_URL=https://api.pinata.cloud
        echo.
        echo # Pinata API Keys ^(get from https://pinata.cloud^)
        echo VITE_PINATA_API_KEY=your_pinata_api_key_here
        echo VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here
        echo.
        echo # Contract Addresses ^(update after deployment^)
        echo VITE_SMART_RENT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
        echo VITE_LISTING_REGISTRY_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
        echo VITE_RENTAL_ESCROW_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
        echo VITE_ARBITRATION_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
        echo VITE_SUBSCRIPTION_MANAGER_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
        echo VITE_REPUTATION_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
    ) > .env.local
    echo ✅ .env.local file created
) else (
    echo ✅ .env.local file already exists
)

REM Compile smart contracts
echo 🔨 Compiling smart contracts...
npm run compile

if %errorlevel% neq 0 (
    echo ❌ Failed to compile smart contracts
    pause
    exit /b 1
)

echo ✅ Smart contracts compiled successfully

REM Run tests
echo 🧪 Running tests...
npm run test

if %errorlevel% neq 0 (
    echo ⚠️  Some tests failed, but continuing...
) else (
    echo ✅ All tests passed
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update .env.local with your Pinata API keys
echo 2. Deploy contracts: npm run deploy:mumbai
echo 3. Update contract addresses in .env.local
echo 4. Start development server: npm run dev
echo.
echo For more information, see README.md
pause
