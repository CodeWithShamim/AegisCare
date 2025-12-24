# 🛡️ AegisCare

<div align="center">

**Privacy-Preserving Clinical Trial Matching Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Zama FHE](https://img.shields.io/badge/Zama-FHEVM-6A0DAD?style=for-the-badge)](https://docs.zama.ai/)

**Revolutionizing healthcare with Fully Homomorphic Encryption**

[Features](#-key-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**AegisCare** is a groundbreaking clinical trial matching platform that leverages **Zama's Fully Homomorphic Encryption (FHE)** to enable privacy-preserving patient-trial matching. Unlike traditional systems where patient medical data must be revealed to determine eligibility, AegisCare performs matching computations on **encrypted data**, ensuring **zero plaintext leakage**.

### 🎯 The Problem

Traditional clinical trial matching requires patients to:
- Share sensitive medical data in plaintext
- Trust multiple third parties with their information
- Risk data breaches and privacy violations
- Face discrimination based on medical history

### 💡 Our Solution

AegisCare uses **FHE to compute eligibility on encrypted data**:
- ✅ Medical data **never leaves the patient's browser in plaintext**
- ✅ Eligibility computed **entirely in the encrypted domain**
- ✅ **Only the patient** can decrypt their own results
- ✅ Trial sponsors **never see patient medical data**
- ✅ Compliant with **HIPAA, GDPR, and healthcare regulations**

---

## ✨ Key Features

### 🔐 Privacy-Preserving Architecture

- **Client-side encryption** - All medical data encrypted before submission
- **FHE operations** - Computations performed on encrypted data
- **Zero plaintext leakage** - No medical data ever revealed in plaintext
- **EIP-712 signatures** - Private decryption with typed data signing
- **ACL-based access control** - Granular decryption permissions

### ⚡ Smart Contract Features

- **FHE eligibility computation** - Encrypted comparisons on-chain
- **Owner management** - Pause/unpause functionality
- **Enhanced metadata** - Timestamps, participant counts, history tracking
- **Gas optimization** - Custom errors for efficient execution
- **Comprehensive events** - Full audit trail

### 🎨 Frontend Features

- **Beautiful responsive UI** - TailwindCSS v4 styling
- **Patient dashboard** - Registration and eligibility checking
- **Trial admin dashboard** - Trial creation and management
- **Real-time wallet connection** - MetaMask integration
- **Comprehensive error handling** - User-friendly messages
- **GitBook-style documentation** - Professional docs site

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and **npm**
- **MetaMask** or compatible Web3 wallet
- Basic understanding of **Ethereum** and **smart contracts**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aegiscare

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

### Access the Application

- **Application:** http://localhost:3000
- **Patient Dashboard:** http://localhost:3000/patient
- **Trial Admin:** http://localhost:3000/trial-admin
- **Documentation:** http://localhost:3000/docs

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Patient Browser                      │
├─────────────────────────────────────────────────────────────┤
│  Medical Data → FHE Encryption → Encrypted Data Upload      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       Zama fhEVM                             │
├─────────────────────────────────────────────────────────────┤
│  Smart Contract: AegisCare.sol                              │
│  • Encrypted Patient Data (euint256 values)                │
│  • Encrypted Trial Criteria (euint256 values)               │
│  • FHE Eligibility Computation                               │
│  • Encrypted Results Storage                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     EIP-712 Decryption                       │
├─────────────────────────────────────────────────────────────┤
│  Patient Signs → Private Decryption → Eligibility Result     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety |
| **TailwindCSS** | 4.x | Styling |
| **ethers.js** | 6.9.0 | Web3 integration |

#### Blockchain
| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.20 | Smart contract language |
| **Zama fhEVM** | Latest | FHE-enabled EVM |
| **Hardhat** | 2.19.0 | Development framework |
| **@zama-fhe/relayer-sdk** | 0.3.0-8 | FHE SDK |

#### Development Tools
- **TypeChain** - TypeScript bindings
- **Docker Compose** - Local fhEVM node
- **ESLint** - Code linting

---

## 📚 Documentation

Comprehensive documentation is available at **[http://localhost:3000/docs](http://localhost:3000/docs)**

### Core Documentation

- **[Getting Started](QUICKSTART.md)** - Quick start guide
- **[Architecture Overview](#-architecture)** - System architecture
- **[API Reference](docs/)** - Complete API docs
- **[Security Guide](SECURITY.md)** - Threat model and best practices
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment

### Key Resources

- **[Zama FHEVM Documentation](https://docs.zama.ai/)** - Learn about FHE
- **[FHE Relayer SDK](https://docs.zama.org/protocol/relayer-sdk-guides)** - SDK guide
- **[fhEVM GitHub](https://github.com/zama-ai/fhevm)** - Source code

---

## 🔧 How It Works

### 1. Patient Registration

```typescript
// Patient encrypts medical data client-side
const encryptedData = await encryptPatientData({
  age: 35,
  gender: 1, // 1=male, 2=female, 3=other
  bmiScore: 24.5,
  hasMedicalCondition: true,
  conditionCode: "E11" // ICD-10 code
});

// Register on blockchain (still encrypted)
await registerPatient(signer, encryptedData, publicKeyHash);
```

### 2. Trial Creation

```typescript
// Sponsor encrypts eligibility criteria
const encryptedCriteria = await encryptTrialCriteria({
  trialName: "Diabetes Study 2025",
  minAge: 18,
  maxAge: 65,
  requiredGender: 0, // 0=all
  minBMIScore: 18.5,
  maxBMIScore: 40
});

// Create trial on blockchain
await registerTrial(signer, trialName, description, encryptedCriteria);
```

### 3. Eligibility Computation

```solidity
// Smart Contract: AegisCare.sol

// All values are encrypted (euint256)
function computeEligibility(uint256 _trialId, address _patientAddress) external {
    // Get encrypted patient data
    Patient storage patient = patients[_patientAddress];

    // Get encrypted trial criteria
    Trial storage trial = trials[_trialId];

    // FHE: Compare encrypted values
    ebool ageInRange = FHE.and(
        FHE.ge(patient.age, trial.minAge),
        FHE.le(patient.age, trial.maxAge)
    );

    ebool genderMatch = FHE.eq(patient.gender, trial.requiredGender);
    ebool bmiInRange = FHE.and(
        FHE.ge(patient.bmiScore, trial.minBMIScore),
        FHE.le(patient.bmiScore, trial.maxBMIScore)
    );

    // Final encrypted result
    ebool isEligible = FHE.and(
        ageInRange,
        FHE.and(genderMatch, bmiInRange)
    );

    // Store encrypted result
    eligibilityResults[_trialId][patient.patientId] = EligibilityResult({
        isEligible: FHE.asEuint256(isEligible),
        decryptable: FHE.asEbool(true),
        computed: true,
        computedAt: block.timestamp
    });
}
```

### 4. Private Result Decryption

```typescript
// Only patient can decrypt their own result
const encryptedResult = await getEligibilityResult(signer, trialId, patientAddress);

// Decrypt with EIP-712 signature
const isEligible = await decryptEligibilityResult(
  encryptedResult,
  contractAddress,
  signer
);

console.log("Eligible:", isEligible); // true or false
```

---

## 🎬 Demo Video

Watch AegisCare in action:

[![AegisCare Demo](https://img.youtube.com/vi/sSwq-D9JzhE/0.jpg)](https://www.youtube.com/watch?v=sSwq-D9JzhE)

**[▶ Watch on YouTube](https://www.youtube.com/watch?v=sSwq-D9JzhE)**

---

## 🗂️ Project Structure

```
aegiscare/
├── contracts/                    # Smart contracts
│   ├── AegisCare.sol            # Main FHE contract (676 lines)
│   └── AegisCare.json           # Contract ABI
│
├── scripts/                      # Deployment scripts
│   ├── deploy.ts                # Automated deployment
│   └── showAccounts.ts          # Account viewer
│
├── test/                        # Test suite
│   └── AegisCare.test.ts        # Comprehensive tests
│
├── lib/                         # Core libraries
│   ├── fheClient.ts             # FHE utilities (400+ lines)
│   └── web3Client.ts            # Web3 utilities (500+ lines)
│
├── components/                  # React components
│   ├── Header.tsx               # Navigation header
│   ├── PatientRegistrationForm.tsx
│   ├── TrialRegistrationForm.tsx
│   └── EligibilityChecker.tsx
│
├── app/                         # Next.js pages
│   ├── page.tsx                 # Landing page
│   ├── patient/                 # Patient dashboard
│   ├── trial-admin/             # Trial admin dashboard
│   └── docs/                    # Documentation
│
├── styles/                      # Stylesheets
│   └── docs.css                 # GitBook-style docs CSS
│
├── .env.local                   # Environment configuration
├── package.json                 # Dependencies
├── hardhat.config.ts           # Hardhat configuration
└── docker-compose.yml          # fhEVM setup
```

---

## 🔐 Security

### Security Features

- **Encryption at source** - Data encrypted before leaving browser
- **FHE computation** - Operations on encrypted data only
- **Private decryption** - EIP-712 signatures required
- **Access control** - ACL manages decryption permissions
- **No plaintext storage** - Only encrypted data on-chain

### Threat Model

See **[SECURITY.md](SECURITY.md)** for comprehensive threat model and security analysis.

---

## 🚢 Deployment

### Local Development

```bash
# Start fhEVM node (optional)
docker-compose up -d fhevm

# Deploy contract locally
npm run deploy:local

# Update .env.local with contract address
NEXT_PUBLIC_AEGISCARE_ADDRESS=0x...

# Start development server
npm run dev
```

### FHEVM Devnet

```bash
# Set up FHEVM devnet
docker-compose up -d fhevm

# Deploy to devnet
npm run deploy

# Verify deployment
npm run test
```

### Production Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for comprehensive production deployment guide.

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with gas reporting
REPORT_GAS=true npm test
```

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Zama](https://www.zama.ai/)** - For pioneering FHE technology
- **[FHEVM Team](https://github.com/zama-ai/fhevm)** - For the fhEVM implementation
- **[FHE Relayer SDK](https://docs.zama.org/protocol/relayer-sdk-guides)** - For excellent documentation
- **[FHE Raffle](https://github.com/dordunu1/Raffle)** - For production-ready FHE patterns

---

## 📞 Support & Community

### Get Help

- **Documentation:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-repo/discussions)

### Community

- **[Zama Discord](https://discord.gg/CEzpKz3CkH)** - Join the FHE community
- **[Zama Forum](https://forum.zama.ai/)** - Ask questions and share knowledge

---

## 🗺️ Roadmap

### Current Release (v0.1.0)

- ✅ Patient registration with encrypted medical data
- ✅ Trial creation with encrypted criteria
- ✅ FHE eligibility computation
- ✅ Private result decryption
- ✅ Beautiful responsive UI
- ✅ Comprehensive documentation

### Upcoming Features

- [ ] Multi-condition matching
- [ ] Geographic location matching
- [ ] Trial sponsor analytics
- [ ] Patient notification system
- [ ] Mobile app (React Native)

---

## 📄 Additional Documentation

- **[SECURITY.md](SECURITY.md)** - Security architecture and threat model
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[QUICKSTART.md](QUICKSTART.md)** - Getting started guide
- **[TESTING_STATUS.md](TESTING_STATUS.md)** - Test results and verification

---

<div align="center">

**Built with ❤️ using Zama FHEVM**

**Privacy-Preserving Clinical Trial Matching**

[⬆ Back to Top](#-aegiscare)

</div>
