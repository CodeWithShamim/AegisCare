# 🛡️ AegisCare

**Privacy-Preserving Clinical Trial Matching powered by Zama FHEVM**

AegisCare is a decentralized platform that matches patients with clinical trials using **Fully Homomorphic Encryption (FHE)**, ensuring that medical data remains **completely private** throughout the entire matching process.

## ✨ Key Features

- 🔒 **Zero-Plaintext Leakage**: Medical data is never revealed in plaintext
- 🔐 **FHE-Powered Computation**: Eligibility matching on encrypted data
- 👤 **Private Decryption**: Only patients can decrypt their results using EIP-712 signatures
- ⚡ **Blockchain-Based**: Transparent, auditable, and censorship-resistant
- 🏥 **HIPAA/GDPR Compliant**: Privacy-by-design architecture

## 🏗️ Architecture

```
Patient Browser                    Blockchain                    Zama FHE Network
──────────────                    ──────────                    ─────────────────
Medical Data
     ↓
FHE Encryption (Client-side)
     ↓
Encrypted Input (einput)
     ↓
Smart Contract (AegisCare)
     ↓
Store as euint256 (Encrypted)
     ↓
FHE Comparison Operations
(age >= minAge) AND (age <= maxAge)
(All encrypted!)
     ↓
Encrypted Result (ebool)
     ↓
Patient Requests Decryption
     ↓
EIP-712 Signature (Proof of Ownership)
     ↓
Zama Gateway Validates
     ↓
Return Decrypted Result (to patient only)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or Web3 wallet
- Zama FHEVM access (devnet or mainnet)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd aegiscare

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
aegiscare/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Landing page
│   ├── patient/             # Patient dashboard
│   └── trial-admin/         # Trial sponsor dashboard
├── components/               # React components
│   ├── PatientRegistrationForm.tsx
│   ├── TrialRegistrationForm.tsx
│   └── EligibilityChecker.tsx
├── contracts/                # Solidity smart contracts
│   └── AegisCare.sol       # Main FHE smart contract
├── lib/                      # Utility libraries
│   ├── fheClient.ts        # FHE encryption/decryption
│   └── web3Client.ts       # Web3 contract interactions
├── SECURITY.md              # Detailed security documentation
├── DEPLOYMENT.md            # Deployment guide
└── README.md                # This file
```

## 🔧 Smart Contract Overview

The `AegisCare` smart contract implements:

1. **Encrypted Patient Registration**: Store encrypted medical data (age, gender, BMI, conditions)
2. **Encrypted Trial Creation**: Define encrypted eligibility criteria
3. **FHE Eligibility Computation**: Match patients to trials on encrypted data
4. **Access Control**: Only patients can decrypt their own results

### Key FHE Operations

```solidity
// Encrypted comparison
ebool ageInRange = FHE.and(
    FHE.ge(patient.age, trial.minAge),    // Greater-or-equal
    FHE.le(patient.age, trial.maxAge)     // Less-or-equal
);

// Encrypted logic
ebool isEligible = FHE.and(
    ageInRange,
    FHE.and(genderMatch, bmiInRange)
);
```

## 🔐 Security Features

### For Patients

✅ **Medical Data Confidentiality**
- Encrypted in browser before transmission
- Never appears in plaintext on-chain
- Never logged or stored in plaintext

✅ **Eligibility Privacy**
- Results encrypted and only decryptable by patient
- Trial sponsors never see individual patient results

✅ **Control**
- Patient owns decryption private key
- EIP-712 signature required for decryption

### For Trial Sponsors

✅ **Regulatory Compliance**
- No plaintext medical data in possession
- HIPAA/GDPR compliant by design

✅ **Trial Integrity**
- Eligibility criteria enforced in smart contract
- Transparent and auditable

See [SECURITY.md](SECURITY.md) for detailed security analysis.

## 📚 How It Works

### 1. Patient Registration

```typescript
// 1. Patient enters medical data
const patientData = {
  age: 35,
  gender: 2,  // female
  bmiScore: 245,  // 24.5 * 10
  hasMedicalCondition: true,
  conditionCode: 'E11'  // Type 2 diabetes
};

// 2. Encrypt client-side
const encrypted = await encryptPatientData(patientData);

// 3. Submit to smart contract
await registerPatient(signer, encrypted, publicKeyHash);
```

### 2. Trial Creation

```typescript
// 1. Sponsor defines eligibility criteria
const criteria = {
  trialName: 'Diabetes Treatment Study',
  minAge: 18,
  maxAge: 75,
  requiredGender: 0,  // all
  minBMIScore: 185,   // 18.5
  maxBMIScore: 400,   // 40.0
  hasSpecificCondition: true,
  conditionCode: 'E11'
};

// 2. Encrypt client-side
const encrypted = await encryptTrialCriteria(criteria);

// 3. Submit to smart contract
await registerTrial(signer, criteria.trialName, criteria.description, encrypted);
```

### 3. Eligibility Check

```typescript
// 1. Compute eligibility on encrypted data
await computeEligibility(signer, trialId, patientAddress);

// 2. Get encrypted result
const encryptedResult = await getEligibilityResult(signer, trialId, patientAddress);

// 3. Decrypt with EIP-712 signature
const isEligible = await decryptEligibilityResult(encryptedResult, contractAddress, signer);

console.log('Eligible:', isEligible);  // true or false
```

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

```bash
NEXT_PUBLIC_FHE_NETWORK_URL=https://devnet.zama.ai/
NEXT_PUBLIC_FHE_GATEWAY_URL=https://gateway.devnet.zama.ai/
NEXT_PUBLIC_BLOCKCHAIN_URL=https://devnet.zama.ai/
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_AEGISCARE_ADDRESS=0xYourContractAddress
```

## 🧪 Testing

### Smart Contract Testing

```bash
# Start local FHEVM node
npm run node

# Run tests
npx hardhat test

# Deploy locally
npx hardhat run scripts/deploy.js --network localhost
```

### Frontend Testing

```bash
# Run development server
npm run dev

# Visit http://localhost:3000
# Test:
# 1. Patient registration
# 2. Trial creation
# 3. Eligibility checking
# 4. Result decryption
```

## 📊 Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Blockchain**: Ethereum (via Zama FHEVM)
- **FHE**: Zama Fully Homomorphic Encryption
- **Web3**: ethers.js v5, viem
- **Cryptography**: EIP-712 signatures, TFHE

## 🔍 Zero-Knowledge Properties

✅ **Trial sponsors learn NOTHING about patients:**
- No patient medical data in plaintext
- No patient identity linked to eligibility
- No way to identify specific patients

✅ **Public learns NOTHING about sensitive data:**
- Only trial names/descriptions are public
- All criteria encrypted
- All patient data encrypted
- All results encrypted

## 🛡️ Threat Model

AegisCare protects against:

- ❌ Malicious blockchain observers extracting medical data
- ❌ Curious trial sponsors accessing patient data
- ❌ Compromised relayer/gateway decrypting results
- ❌ Hacker intercepting plaintext data
- ❌ Blockchain validators seeing sensitive information

See [SECURITY.md](SECURITY.md) for complete threat model.

## 📖 Documentation

- **[SECURITY.md](SECURITY.md)**: Detailed security analysis and threat model
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Step-by-step deployment guide
- **[Zama FHEVM Docs](https://docs.zama.ai/)**: FHE documentation
- **[fhevmjs](https://www.npmjs.com/package/fhevmjs)**: JavaScript SDK

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Zama** for FHEVM and FHE tooling
- **Ethereum Foundation** for blockchain infrastructure
- **FHE Research Community** for groundbreaking work

## ⚠️ Disclaimer

This is a demonstration project. For production use in clinical settings:

- Obtain security audit
- Ensure regulatory compliance
- Implement proper key management
- Set up monitoring and incident response
- Obtain necessary approvals from ethics committees

## 📧 Contact

For questions or support:
- GitHub Issues: [Create an issue](../../issues)
- Documentation: [See docs](./SECURITY.md)

---

**Built with ❤️ for privacy-preserving healthcare**

Powered by **Zama FHEVM** - Making encrypted computation a reality
# AegisCare
