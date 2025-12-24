# AegisCare Deployment Guide

This guide walks you through deploying AegisCare to production, including smart contract deployment, frontend deployment, and configuration.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Smart Contract Deployment](#2-smart-contract-deployment)
3. [Frontend Deployment](#3-frontend-deployment)
4. [Environment Configuration](#4-environment-configuration)
5. [Verification](#5-verification)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Tools

Install the following tools:

```bash
# Node.js and npm
node --version  # Should be v18+ and npm v9+

# Git
git --version

# Python (for some Zama FHE tools)
python3 --version
```

### 1.2 Wallet Setup

You need a Web3 wallet with testnet tokens:

- **MetaMask** or compatible wallet
- **Zama FHE Devnet** (for testing) or **Mainnet** (for production)
- **Gas tokens** for contract deployment

### 1.3 Zama FHEVM Setup

Follow the official Zama FHEVM documentation:

```bash
# Clone Zama FHEVM repository
git clone https://github.com/zama-ai/fhevm.git
cd fhevm

# Install dependencies
npm install

# Build FHEVM contracts
npm run build
```

---

## 2. Smart Contract Deployment

### 2.1 Compile Smart Contract

First, ensure you have the Solidity compiler and FHE libraries:

```bash
# Install Hardhat (recommended)
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers@5

# Create Hardhat config
npx hardhat
```

Create `hardhat.config.js`:

```javascript
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    // Zama FHE Devnet
    fhevm_devnet: {
      url: process.env.FHEVM_RPC_URL || "http://localhost:8545",
      chainId: 1337,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
```

### 2.2 Deploy to Local Network

Start the Zama FHEVM local node:

```bash
# In the fhevm directory
npm run node
```

Deploy the contract:

```bash
# Create deployment script
mkdir -p scripts
```

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying AegisCare...");

  // Get the ContractFactory
  const AegisCare = await hre.ethers.getContractFactory("AegisCare");

  // Deploy contract
  const aegisCare = await AegisCare.deploy();

  await aegisCare.deployed();

  console.log("AegisCare deployed to:", aegisCare.address);

  // Wait for a few block confirmations
  await aegisCare.deployTransaction.wait(5);

  console.log("Deployment confirmed!");

  // Verify contract is working
  const trialCount = await aegisCare.trialCount();
  console.log("Initial trial count:", trialCount.toString());

  return aegisCare.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run deployment:

```bash
npx hardhat run scripts/deploy.js --network fhevm_devnet
```

**Expected Output:**
```
Deploying AegisCare...
AegisCare deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deployment confirmed!
Initial trial count: 0
```

### 2.3 Deploy to Zama Devnet

Configure your environment:

```bash
# .env file
PRIVATE_KEY=your_wallet_private_key
FHEVM_RPC_URL=https://devnet.zama.ai/
```

Deploy:

```bash
npx hardhat run scripts/deploy.js --network fhevm_devnet
```

### 2.4 Verify Contract (Optional)

If using a network with block explorer (like Zama Devnet):

```bash
npx hardhat verify --network fhevm_devnet CONTRACT_ADDRESS
```

---

## 3. Frontend Deployment

### 3.1 Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Zama FHE Network Configuration
NEXT_PUBLIC_FHE_NETWORK_URL=https://devnet.zama.ai/
NEXT_PUBLIC_FHE_GATEWAY_URL=https://gateway.devnet.zama.ai/

# Blockchain Configuration
NEXT_PUBLIC_BLOCKCHAIN_URL=https://devnet.zama.ai/
NEXT_PUBLIC_CHAIN_ID=1337

# Smart Contract Address (from deployment)
NEXT_PUBLIC_AEGISCARE_ADDRESS=0xYourContractAddress

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Build Frontend

Install dependencies:

```bash
npm install
```

Build the application:

```bash
npm run build
```

Test locally:

```bash
npm run start
```

Visit `http://localhost:3000` to verify the app works.

### 3.3 Deploy to Vercel (Recommended)

Install Vercel CLI:

```bash
npm install -g vercel
```

Deploy:

```bash
vercel
```

Follow the prompts:

1. Set up and deploy `~/buildingApps/aegiscare`
2. Link to existing project or create new
3. Set environment variables in Vercel dashboard
4. Deploy!

**Add Environment Variables in Vercel Dashboard:**

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable from `.env.local`:

```
NEXT_PUBLIC_FHE_NETWORK_URL=https://devnet.zama.ai/
NEXT_PUBLIC_FHE_GATEWAY_URL=https://gateway.devnet.zama.ai/
NEXT_PUBLIC_BLOCKCHAIN_URL=https://devnet.zama.ai/
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_AEGISCARE_ADDRESS=0xYourContractAddress
```

5. Redeploy with new variables

### 3.4 Deploy to Other Platforms

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### AWS S3 + CloudFront

```bash
# Build the app
npm run build

# Sync to S3
aws s3 sync out/ s3://your-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t aegiscare .
docker run -p 3000:3000 -e NEXT_PUBLIC_AEGISCARE_ADDRESS=0x... aegiscare
```

---

## 4. Environment Configuration

### 4.1 Development Environment

`.env.local`:

```bash
# Development settings
NEXT_PUBLIC_FHE_NETWORK_URL=https://devnet.zama.ai/
NEXT_PUBLIC_FHE_GATEWAY_URL=https://gateway.devnet.zama.ai/
NEXT_PUBLIC_BLOCKCHAIN_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_AEGISCARE_ADDRESS=0xYourLocalContractAddress
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=true
```

### 4.2 Production Environment

`.env.production`:

```bash
# Production settings
NEXT_PUBLIC_FHE_NETWORK_URL=https://mainnet.zama.ai/
NEXT_PUBLIC_FHE_GATEWAY_URL=https://gateway.mainnet.zama.ai/
NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_AEGISCARE_ADDRESS=0xYourMainnetContractAddress
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_DEBUG=false
```

### 4.3 Security Best Practices

- ✅ Never commit `.env.local` or `.env.production` to git
- ✅ Use different wallet addresses for dev/prod
- ✅ Rotate private keys regularly
- ✅ Use secrets management in production (AWS Secrets Manager, etc.)
- ✅ Enable CI/CD environment variable encryption

---

## 5. Verification

### 5.1 Smart Contract Verification

After deployment, verify the contract is working:

```javascript
// Using Hardhat console
npx hardhat console --network fhevm_devnet

const AegisCare = await ethers.getContractFactory("AegisCare");
const aegisCare = await AegisCare.attach("0xYourContractAddress");

// Check state
const trialCount = await aegisCare.trialCount();
console.log("Trial count:", trialCount.toString());

const patientCount = await aegisCare.patientCount();
console.log("Patient count:", patientCount.toString());
```

### 5.2 Frontend Verification

1. Visit the deployed URL
2. Click "I'm a Patient"
3. Connect wallet
4. Try registering with test data
5. Check browser console for any errors

### 5.3 Integration Testing

Create test script `scripts/integration-test.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const AegisCare = await hre.ethers.getContractFactory("AegisCare");
  const aegisCare = await AegisCare.attach("0xYourContractAddress");

  console.log("Running integration tests...");

  // Test 1: Register trial
  console.log("\n1. Registering trial...");
  const tx1 = await aegisCare.registerTrial(
    "Test Trial",
    "Integration test trial",
    // Encrypted inputs would go here
    hre.ethers.utils.formatBytes32String("18"),  // minAge (encrypted)
    hre.ethers.utils.formatBytes32String("65"),  // maxAge (encrypted)
    hre.ethers.utils.formatBytes32String("0"),   // gender (encrypted)
    hre.ethers.utils.formatBytes32String("185"), // minBMI (encrypted)
    hre.ethers.utils.formatBytes32String("400"), // maxBMI (encrypted)
    hre.ethers.utils.formatBytes32String("0"),   // hasCondition (encrypted)
    hre.ethers.utils.formatBytes32String("0")    // conditionCode (encrypted)
  );
  await tx1.wait();
  console.log("✓ Trial registered");

  // Test 2: Check trial count
  const trialCount = await aegisCare.trialCount();
  console.log(`✓ Trial count: ${trialCount}`);

  console.log("\nAll tests passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run tests:

```bash
npx hardhat run scripts/integration-test.js --network fhevm_devnet
```

---

## 6. Troubleshooting

### 6.1 Common Issues

#### Issue: "Network not configured"

**Solution:**
```bash
# Check Hardhat config
cat hardhat.config.js

# Verify RPC URL
echo $FHEVM_RPC_URL
```

#### Issue: "Contract deployment failed"

**Solution:**
```bash
# Check gas settings
export GAS_PRICE=100000000000

# Check wallet balance
npx hardhat run scripts/check-balance.js --network fhevm_devnet
```

#### Issue: "FHE encryption fails"

**Solution:**
```bash
# Verify FHE network URL
curl $NEXT_PUBLIC_FHE_NETWORK_URL

# Check browser console for FHE errors
# Ensure @zama-fhe/relayer-sdk is installed
npm list @zama-fhe/relayer-sdk
```

#### Issue: "Decryption fails with signature error"

**Solution:**
- Ensure wallet is connected
- Check EIP-712 domain matches contract address
- Verify contract address in environment variables

### 6.2 Debug Mode

Enable debug logging:

```bash
# .env.local
NEXT_PUBLIC_DEBUG=true
```

Check browser console for detailed logs:
- `[FHE]` - FHE client operations
- `[Web3]` - Blockchain operations
- `[Contract]` - Smart contract interactions

### 6.3 Getting Help

If you encounter issues:

1. Check Zama FHEVM documentation: https://docs.zama.ai/
2. Review SECURITY.md for security considerations
3. Check Zama Discord/community for FHE-specific issues
4. Review smart contract logs: `npx hardhat console --network fhevm_devnet`

---

## 7. Production Checklist

Before going to production:

- [ ] Smart contract audited
- [ ] Deployed to mainnet (not devnet)
- [ ] Environment variables configured correctly
- [ ] Frontend tested on production network
- [ ] Domain configured with SSL
- [ ] Monitoring and logging set up
- [ ] Error tracking (Sentry, etc.)
- [ ] Backup procedures documented
- [ ] Incident response plan ready
- [ ] Regulatory compliance verified (HIPAA/GDPR)

---

## 8. Maintenance

### 8.1 Updates

To update the application:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Redeploy
vercel --prod
```

### 8.2 Smart Contract Upgrades

If you need to upgrade the smart contract:

1. Deploy new contract version
2. Migrate state if needed
3. Update `NEXT_PUBLIC_AEGISCARE_ADDRESS`
4. Verify migration worked
5. Decommission old contract (optional)

### 8.3 Monitoring

Set up monitoring for:
- Contract events (new trials, patients, eligibility checks)
- Frontend errors
- FHE gateway uptime
- Gas costs and transaction times

---

*Last Updated: 2025-12-24*
*Version: 1.0.0*
