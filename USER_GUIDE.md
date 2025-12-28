# 🛡️ AegisCare - Complete User Guide

## 📖 Table of Contents

1. [What is AegisCare?](#what-is-aegiscare)
2. [Why Do We Need It?](#why-do-we-need-it)
3. [How Does It Work?](#how-does-it-work)
4. [Key Concepts Explained](#key-concepts-explained)
5. [Technology Stack](#technology-stack)
6. [Who Should Use This?](#who-should-use-this)
7. [Real-World Use Cases](#real-world-use-cases)
8. [Getting Started Tutorial](#getting-started-tutorial)
9. [Security & Privacy](#security--privacy)
10. [FAQ](#faq)

---

## What is AegisCare?

**AegisCare** is a **privacy-preserving clinical trial matching platform** that uses **Fully Homomorphic Encryption (FHE)** to match patients with clinical trials without exposing their medical data.

### 🎯 The Simple Explanation

**Traditional Approach:**
```
Patient → Shares medical data → Trial Sponsor reviews → Patient matched/rejected
           ❌ Privacy Risk          ❌ Data exposed
```

**AegisCare Approach:**
```
Patient → Encrypts data → Matches on encrypted data → Only patient sees result
          ✅ Privacy Protected   ✅ No data exposed
```

### 🌟 What Makes It Special?

| Feature | Traditional Systems | AegisCare |
|---------|-------------------|------------|
| **Privacy** | Medical data exposed to sponsors | ✅ Medical data never revealed |
| **Matching** | Plaintext comparison | ✅ Encrypted comparison |
| **Control** | Third parties store your data | ✅ You control decryption |
| **Compliance** | Privacy concerns | ✅ HIPAA/GDPR compliant |
| **Trust** | Must trust multiple parties | ✅ Zero-knowledge proof |

---

## Why Do We Need It?

### 🏥 The Problem

**Imagine Sarah, a 45-year-old woman with Type 2 diabetes:**

1. **She wants to join a clinical trial** for a new diabetes treatment
2. **To apply, she must share**:
   - Age, weight, medical history
   - Specific health condition details
   - Personal contact information
3. **Privacy concerns:**
   - Will her insurance company find out?
   - Could her employer see this data?
   - What if there's a data breach?
   - Who has access to her sensitive health information?

### 💡 The Solution

**AegisCare solves these problems:**

1. **🔒 Client-Side Encryption**
   - Sarah's data is encrypted in her browser
   - Encrypted data is sent to the blockchain
   - **Nobody can see her actual medical data**

2. **🔐 Encrypted Matching**
   - Trial criteria are also encrypted
   - Matching happens on encrypted data
   - **Sponsors learn NOTHING about Sarah**

3. **🔑 Private Results**
   - Only Sarah can decrypt her eligibility result
   - Uses cryptographic signatures (EIP-712)
   - **Complete privacy preserved**

### 📊 The Impact

| Stakeholder | Traditional | AegisCare |
|--------------|-------------|------------|
| **Patients** | Must expose sensitive data | ✅ Privacy protected |
| **Trial Sponsors** | See patient data (legal risk) | ✅ Zero-knowledge matching |
| **Regulators** | Complex compliance | ✅ GDPR/HIPAA friendly |
| **Researchers** | Limited patient pool | ✅ More patients willing to participate |

---

## How Does It Work?

### 🔄 Step-by-Step Process

#### **For Patients:**

```
1. REGISTER (Encrypted)
   ↓
   Enter: Age 45, Gender Female, BMI 28.5, Condition: Diabetes E11
   ↓
   🔒 Encrypted in browser using FHE
   ↓
   Stored on blockchain (encrypted)
   ↓
2. CHECK ELIGIBILITY
   ↓
   Select: "Diabetes Treatment Study 2025"
   ↓
   ⚡ Computation on encrypted data
   ↓
3. DECRYPT RESULT (Private)
   ↓
   Sign message with private key
   ↓
   🔓 Only YOU see: ELIGIBLE ✅ or NOT ELIGIBLE ❌
```

#### **For Trial Sponsors:**

```
1. CREATE TRIAL (Encrypted Criteria)
   ↓
   Enter: Age 18-65, Required Condition: E11
   ↓
   🔒 Criteria encrypted in browser
   ↓
   Stored on blockchain (encrypted)
   ↓
2. WAIT FOR PATIENTS
   ↓
   Patients check their eligibility
   ↓
   ⚡ Matching happens automatically
   ↓
3. VIEW RESULTS
   ↓
   See: Number of eligibility checks
   ✅ NO patient data revealed
```

### 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              Patient's Computer                       │
│  ┌──────────────────────────────────────────────┐  │
│  │  Medical Data (Plaintext)                     │  │
│  │  Age: 45, BMI: 28.5, Condition: Diabetes    │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
│                 ▼                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  🔒 FHE Encryption (Client-Side)           │  │
│  │  Zama RelayerSDK encrypts all data          │  │
│  └──────────────┬───────────────────────────────┘  │
└─────────────────┼───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Ethereum Sepolia Testnet               │
│  ┌──────────────────────────────────────────────┐  │
│  │  AegisCare Smart Contract                    │  │
│  │  Address: 0x3DB49...76c4192F7               │  │
│  │                                               │  │
│  │  🔒 Encrypted Patient Data                   │  │
│  │  🔒 Encrypted Trial Criteria                 │  │
│  │  ⚡ FHE Eligibility Computation             │  │
│  │  🔒 Encrypted Results                       │  │
│  └──────────────┬───────────────────────────────┘  │
└─────────────────┼───────────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Patient Only  │
         │   Decrypts     │
         │   Result       │
         └────────────────┘
```

---

## Key Concepts Explained

### 🔐 What is FHE (Fully Homomorphic Encryption)?

**In Simple Terms:**
- **Traditional encryption**: You must decrypt to use data
- **FHE**: You can perform calculations **without decrypting**

**Example:**
```
Traditional:
  5 + 3 = 8  (must be visible to calculate)

FHE:
  E(5) + E(3) = E(8)  (everything stays encrypted!)
```

**In AegisCare:**
```
Patient's actual age: 45        ← Never revealed!
Encrypted age: E(45)
Trial criteria: E([18-65])
Result: E(eligible) ← Can only be decrypted by patient
```

### 🔑 What is EIP-712?

**Simple Explanation:**
- A standard for **typed structured data signing**
- Used to **prove identity** without exposing private keys
- **More secure** than simple transaction signing

**In AegisCare:**
```
1. Patient wants to see eligibility result
2. Contract asks for signature
3. Patient signs: "I own address 0x123..."
4. Contract verifies: Yes, this is the patient
5. Patient can now decrypt result
```

### 🎭 What are ACLs (Access Control Lists)?

**Simple Explanation:**
- Permissions for who can decrypt encrypted data
- Each encrypted value has an ACL
- **Only authorized addresses can decrypt**

**In AegisCare:**
```
Encrypted eligibility result:
  - Allowed: Patient address ✅
  - Allowed: Contract address ✅
  - Not allowed: Trial sponsor ❌
  - Not allowed: Public ❌
```

---

## Technology Stack

### 🛠️ Frontend (User Interface)

| Technology | Purpose | Why It's Used |
|-------------|---------|---------------|
| **Next.js 16** | Web framework | Modern React with App Router |
| **React 19** | UI library | Latest React features |
| **TypeScript** | Type safety | Prevents bugs, better IDE support |
| **TailwindCSS 4** | Styling | Fast, responsive design |
| **ethers.js v6** | Blockchain | Interact with Ethereum |

### 🔐 Encryption & Privacy

| Technology | Purpose | Why It's Used |
|-------------|---------|---------------|
| **Zama FHE SDK** | Client encryption | Encrypt data before sending |
| **fhEVM** | Blockchain with FHE | Perform encrypted computations |
| **EIP-712** | Secure signing | Prove identity safely |

### ⛓ Blockchain

| Component | Purpose |
|-----------|---------|
| **Solidity 0.8.27** | Smart contract language |
| **Sepolia Testnet** | Testing environment |
| **Hardhat** | Development framework |

---

## Who Should Use This?

### 👥 Target Users

#### **1. Patients**
- ✅ Want to join clinical trials
- ✅ Concerned about medical data privacy
- ✅ Have sensitive health conditions

#### **2. Trial Sponsors**
- ✅ Pharmaceutical companies
- ✅ Research institutions
- ✅ Medical device companies
- ✅ Want to reduce legal/compliance risk

#### **3. Developers**
- ✅ Building privacy-preserving apps
- ✅ Learning about FHE
- ✅ Contributing to the project

### 🎯 Ideal Use Cases

**Perfect for:**
- ✅ Sensitive medical trials (HIV, mental health, genetic conditions)
- ✅ Competitive industries (where data leaks are costly)
- ✅ Privacy-focused research
- ✅ Regulatory-heavy environments

**Not ideal for:**
- ❌ Publicly available trials (no privacy needed)
- ❌ Simple matching without sensitive data
- ❌ Projects needing real-time data sharing

---

## Real-World Use Cases

### 📋 Use Case 1: Diabetes Trial

**Scenario:**
- **Trial:** Testing new Type 2 diabetes medication
- **Criteria:** Age 18-65, BMI 18.5-35, Must have Type 2 diabetes (E11)
- **Challenge:** Patients don't want employers/insurers knowing

**How AegisCare Helps:**
```
Patient (Age 45, BMI 28.5, has E11)
  ↓
Encrypts data → Sends to blockchain
  ↓
Checks eligibility → Computation on encrypted data
  ↓
Decrypts result → Only patient sees: ELIGIBLE ✅
  ↓
Trial sponsor sees: "1 person checked eligibility"
  ✅ NO medical data revealed
```

### 📋 Use Case 2: Mental Health Trial

**Scenario:**
- **Trial:** Depression treatment study
- **Criteria:** Age 25-60, Has depression diagnosis (F32-F33)
- **Challenge:** Stigma around mental health

**How AegisCare Helps:**
```
Patient's diagnosis: Depression (F32)
  ↓
Encrypted → Stored securely
  ↓
Matches with trial → Encrypted computation
  ↓
Only patient knows result
  ✅ Zero stigma, complete privacy
```

### 📋 Use Case 3: Rare Disease Research

**Scenario:**
- **Trial:** Genetic disorder study
- **Criteria:** Specific genetic marker (rare)
- **Challenge:** Only 100 patients worldwide, all want privacy

**How AegisCare Helps:**
- ✅ Patients willing to participate (privacy assured)
- ✅ Researchers get matches (without seeing patient data)
- ✅ Higher participation rates
- ✅ Faster trial completion

---

## Getting Started Tutorial

### 🚀 Quick Start (5 Minutes)

#### **Prerequisites**
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
http://localhost:3000
```

#### **Step 1: Connect Wallet** (30 seconds)
```
1. Click "Connect Wallet" in top-right
2. Approve MetaMask connection
3. Ensure you're on Sepolia testnet
```

#### **Step 2: Register as Patient** (2 minutes)
```
1. Go to http://localhost:3000/patient
2. Fill in medical data:
   - Age: 45
   - Gender: Male (1)
   - BMI: 28.5
   - Has Medical Condition: Yes
   - Condition Code: E11 (Type 2 Diabetes)
3. Click "Register Patient"
4. Approve MetaMask transaction
5. ✅ Your data is encrypted before sending!
```

#### **Step 3: Create Trial (Sponsors)** (2 minutes)
```
1. Go to http://localhost:3000/trial-admin
2. Fill in trial details:
   - Trial Name: "Diabetes Treatment Study"
   - Description: "Testing new medication"
   - Min Age: 18
   - Max Age: 65
   - Required Gender: All (0)
   - Min BMI: 18.5
   - Max BMI: 35
   - Requires Condition: Yes
   - Condition Code: E11
3. Click "Create Trial"
4. Approve transaction
5. ✅ Trial criteria encrypted on blockchain!
```

#### **Step 4: Check Eligibility** (1 minute)
```
1. As a patient, select a trial from dropdown
2. Click "Check Eligibility"
3. Approve transaction
4. Wait for computation
5. Click "Decrypt Result"
6. Sign the message that appears
7. ✅ View your eligibility status!
```

---

## Security & Privacy

### 🔒 Privacy Guarantees

| Feature | How It Works | Benefit |
|---------|--------------|---------|
| **Zero Knowledge** | Sponsors receive encrypted data only | Trial sponsors learn NOTHING about patients |
| **Verifiable Computation** | All computations on-chain | Results can be audited |
| **Patient Control** | Only patient can decrypt their result | Complete control over personal data |
| **No Plaintext Storage** | Only encrypted data on blockchain | Data breaches useless |
| **EIP-712 Signing** | Cryptographic identity proof | Secure access control |

### 🛡️ Security Features

#### **1. Client-Side Encryption**
```
Patient Data → Browser (encrypted) → Blockchain
                                    ↑
                              Never plaintext here!
```

#### **2. ACL-Based Access Control**
```
Encrypted Result:
  ✓ Patient can decrypt
  ✓ Contract can decrypt (for operations)
  ✗ Trial sponsor cannot decrypt
  ✗ Public cannot decrypt
```

#### **3. Pausable Contract**
```
Owner can pause in emergency
  ↓
All operations stopped
  ↓
Security issue addressed
  ↓
Owner can unpause
```

### ✅ Compliance

**GDPR (General Data Protection Regulation):**
- ✅ Data minimization (only necessary data encrypted)
- ✅ Privacy by design (encryption at source)
- ✅ Right to be forgotten (deactivate trials)

**HIPAA (Health Insurance Portability and Accountability Act):**
- ✅ Protected Health Information (PHI) not disclosed
- ✅ Access controls (patient-only decryption)
- ✅ Audit trail (all transactions on blockchain)

---

## FAQ

### ❓ General Questions

**Q: What happens if my data is breached?**
A: Your encrypted data is useless without your private key. Even if hackers access the blockchain, they only see encrypted values.

**Q: Can trial sponsors see my medical information?**
A: NO. Trial sponsors only see encrypted data. They cannot decrypt it.

**Q: How do I know the matching is fair?**
A: All computations happen on the blockchain. Anyone can verify the contract code and transactions.

**Q: What if I forget which trials I checked?**
A: You can query the blockchain to see your eligibility check history (only your address can do this).

**Q: Can I delete my data?**
A: Your encrypted data is on the blockchain forever (immutable). However, trials can be deactivated so no more computations occur.

### ❓ Technical Questions

**Q: What blockchain does this use?**
A: Ethereum Sepolia testnet (for testing). Will use mainnet for production.

**Q: What is the gas cost?**
A: Patient registration: ~$0.50-1.00 | Trial creation: ~$1.00-2.00 | Eligibility check: ~$0.20-0.50

**Q: Is this open source?**
A: Yes! All code is on GitHub. Smart contract is verified on Etherscan.

**Q: How does FHE work?**
A: FHE allows computations on encrypted data. It's like having a locked box that can process items without opening it.

### ❓ Usage Questions

**Q: I'm not technical. Can I use this?**
A: Yes! The user interface is simple. Just connect MetaMask and follow the prompts.

**Q: Do I need ETH to use this?**
A: Yes, but only testnet ETH (free from faucets). Real ETH not needed.

**Q: Can I register for multiple trials?**
A: Yes! You can check your eligibility against any trial.

**Q: What if I'm not eligible?**
A: No problem. Try another trial. Your privacy is always protected.

---

## 🎓 Learning Resources

### 📚 Documentation

- **[README.md](README.md)** - Complete technical documentation
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[API Documentation](docs)** - Complete API reference

### 🔗 External Resources

- **[Zama FHE Documentation](https://docs.zama.ai/)** - Learn about FHE
- **[FHE Relayer SDK](https://docs.zama.org/protocol/relayer-sdk-guides)** - SDK guide
- **[Sepolia Faucet](https://sepoliafaucet.com/)** - Get free testnet ETH
- **[ICD-10 Codes](https://www.icd10data.com/)** - Medical condition codes

### 💬 Community

- **[GitHub Issues](https://github.com/your-repo/issues)** - Report bugs
- **[Zama Discord](https://discord.gg/CEzpKz3CkH)** - FHE community
- **[Zama Forum](https://forum.zama.ai/)** - Ask questions

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guidelines](CONTRIBUTING.md) for details.

### 🐛 Bug Reports

Found a bug? Please create an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details

### 💡 Feature Requests

Have an idea? Please create an issue with:
- Feature description
- Use case explanation
- Potential implementation approach

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using Zama FHEVM**

**Privacy-Preserving Clinical Trial Matching**

**⭐ Star us on GitHub!**

</div>
