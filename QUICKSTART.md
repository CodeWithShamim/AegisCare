# 🚀 AegisCare Quick Start Guide

Welcome to **AegisCare** - the privacy-preserving clinical trial matching platform! This guide will get you up and running in minutes.

---

## ⚡ 5-Minute Quick Start

### Step 1: Install & Run (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd aegiscare

# Install dependencies
npm install

# Start the development server
npm run dev
```

**That's it!** The app will be running at http://localhost:3000

### Step 2: Get Sepolia ETH (1 minute)

1. Install [MetaMask](https://metamask.io/)
2. Add Sepolia testnet to MetaMask
3. Get free Sepolia ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)

### Step 3: Connect Wallet (30 seconds)

1. Visit http://localhost:3000
2. Click "Connect Wallet" in the top right
3. Approve the MetaMask connection
4. Ensure you're on **Sepolia Testnet** ✅

### Step 4: Try It Out! (2 minutes)

**Option A: Register as a Patient**
- Go to http://localhost:3000/patient
- Enter test data:
  - Age: `45`
  - Gender: `Male (1)`
  - BMI: `28.5`
  - Has Condition: `Yes`
  - Condition Code: `E11` (Type 2 Diabetes)
- Click "Register Patient"
- Approve transaction ✅

**Option B: Create a Trial**
- Go to http://localhost:3000/trial-admin
- Enter trial details:
  - Name: `Diabetes Study 2025`
  - Min Age: `18`
  - Max Age: `65`
  - Condition Code: `E11`
- Click "Create Trial"
- Approve transaction ✅

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Node.js 20+** installed ([Download](https://nodejs.org/))
- [ ] **npm** or **yarn** package manager
- [ ] **MetaMask** browser extension ([Download](https://metamask.io/))
- [ ] **Sepolia ETH** for gas fees ([Get from faucet](https://sepoliafaucet.com/))
- [ ] **Git** for cloning the repository

---

## 🔧 Installation Guide

### 1. Clone Repository

```bash
git clone https://github.com/your-username/aegiscare.git
cd aegiscare
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16.1.1
- React 19.2.3
- ethers.js v6
- Zama FHE SDK
- All other dependencies

### 3. Environment Configuration

The `.env` file is already configured for Sepolia testnet:

```env
# Blockchain Configuration
NEXT_PUBLIC_BLOCKCHAIN_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CHAIN_ID=11155111

# Deployed Contract Address (Sepolia)
NEXT_PUBLIC_AEGISCARE_ADDRESS=0x86eC51d826Ac059d97D44E8c30FF7F0c7AdC35c3

# WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

**No changes needed!** The contract is already deployed. ✅

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 🎯 First Time Usage

### Connecting Your Wallet

1. **Click "Connect Wallet"** button in the header
2. **MetaMask popup** will appear
3. **Click "Next"** → "Connect" → "Sign" (if prompted)
4. **Wallet connected!** You'll see your address in the header

### Switching to Sepolia Testnet

1. **Open MetaMask**
2. **Click the network dropdown** (top left)
3. **Select "Sepolia Testnet"**
   - If not visible, click "Add Network" → "Sepolia Testnet"

---

## 👤 Patient Registration

### Step-by-Step Guide

1. **Navigate to Patient Dashboard**
   - Go to http://localhost:3000/patient
   - Or click "Patient" in the navigation

2. **Fill in Your Medical Data**

   ```
   ┌─────────────────────────────────────┐
   │ Patient Registration Form           │
   ├─────────────────────────────────────┤
   │ Age: [45]                           │
   │ Gender: [Male ▼]                     │
   │   • Male (1)                        │
   │   • Female (2)                      │
   │   • Other (3)                       │
   │                                     │
   │ BMI Score: [28.5]                   │
   │ Has Medical Condition: [Yes ✅]     │
   │ Condition Code: [E11]              │
   │   (ICD-10 Code)                    │
   │                                     │
   │ [Register Patient]                 │
   └─────────────────────────────────────┘
   ```

3. **Click "Register Patient"**
   - **Your data is encrypted in the browser** before being sent! 🔒
   - MetaMask will popup for transaction approval
   - Click "Confirm" to pay gas fees (~0.001 ETH)

4. **Wait for Confirmation**
   - Transaction will be mined in ~15 seconds
   - You'll see a success message ✅

### Test Data Examples

Use these **pre-configured test patients**:

#### Example 1: Diabetes Patient
```json
Age: 45
Gender: Male (1)
BMI: 28.5
Has Condition: Yes
Condition Code: E11 (Type 2 Diabetes)
```

#### Example 2: Healthy Adult
```json
Age: 32
Gender: Female (2)
BMI: 22.1
Has Condition: No
Condition Code: Z00 (General exam)
```

#### Example 3: Hypertension Patient
```json
Age: 58
Gender: Male (1)
BMI: 31.2
Has Condition: Yes
Condition Code: I10 (Hypertension)
```

---

## 🏥 Clinical Trial Creation

### Step-by-Step Guide

1. **Navigate to Trial Admin Dashboard**
   - Go to http://localhost:3000/trial-admin
   - Or click "Trial Admin" in navigation

2. **Fill in Trial Information**

   ```
   ┌─────────────────────────────────────┐
   │ Trial Registration Form             │
   ├─────────────────────────────────────┤
   │ Trial Name:                         │
   │ [Diabetes Treatment Study 2025]     │
   │                                     │
   │ Description:                        │
   │ [Testing new treatment for T2D]     │
   │                                     │
   │ Eligibility Criteria:              │
   │ ┌───────────────────────────────┐  │
   │ │ Min Age: [18]                 │  │
   │ │ Max Age: [65]                 │  │
   │ │ Required Gender: [All ▼]       │  │
   │ │ Min BMI: [18.5]                │  │
   │ │ Max BMI: [35]                  │  │
   │ │ Has Condition: [Yes]           │  │
   │ │ Condition Code: [E11]          │  │
   │ └───────────────────────────────┘  │
   │                                     │
   │ [Create Clinical Trial]            │
   └─────────────────────────────────────┘
   ```

3. **Click "Create Clinical Trial"**
   - **Trial criteria are encrypted** before being sent! 🔒
   - MetaMask popup for approval
   - Click "Confirm" (~0.002 ETH gas)

4. **Trial Created Successfully!** ✅

### Test Trial Examples

#### Trial 1: Diabetes Study
```json
Name: Diabetes Treatment Study 2025
Description: Testing new Type 2 diabetes treatment

Eligibility:
- Min Age: 18
- Max Age: 65
- Gender: All (0)
- Min BMI: 18.5
- Max BMI: 35
- Has Condition: Yes
- Condition Code: E11
```

#### Trial 2: Cardiovascular Study
```json
Name: Cardiovascular Health Research
Description: Heart health study for adults 40-70

Eligibility:
- Min Age: 40
- Max Age: 70
- Gender: All (0)
- Min BMI: 20
- Max BMI: 40
- Has Condition: Yes
- Condition Code: I10
```

#### Trial 3: Wellness Study
```json
Name: General Wellness Study
Description: Open study for healthy adults

Eligibility:
- Min Age: 18
- Max Age: 65
- Gender: All (0)
- Min BMI: 18.5
- Max BMI: 30
- Has Condition: No
- Condition Code: Z00
```

---

## 🔍 Checking Eligibility

### The Privacy-Preserving Magic!

This is where **FHE shines**! Eligibility is computed on **encrypted data** - no one sees your medical information! ✨

### Step-by-Step Guide

1. **Go to Patient Dashboard**
   - http://localhost:3000/patient

2. **Select a Trial**
   - Use the trial dropdown
   - All available trials are listed

3. **Click "Check Eligibility"**
   - **Computation happens on encrypted data!** 🔐
   - MetaMask popup → Approve (~0.001 ETH)

4. **Wait for Computation**
   - Takes ~15-20 seconds
   - Smart contract compares encrypted values
   - Result stored as encrypted boolean

5. **Decrypt Your Result**
   - Click "Decrypt Result" button
   - **Only YOU can decrypt** your result with your private key 🔑
   - Sign EIP-712 message in MetaMask
   - View your eligibility: `✅ ELIGIBLE` or `❌ NOT ELIGIBLE`

### What Happens Behind the Scenes

```
1. Your encrypted medical data:
   age: euint256(encrypted_value)
   gender: euint256(encrypted_value)
   bmi: euint256(encrypted_value)
   condition: euint256(encrypted_value)

2. Trial's encrypted criteria:
   minAge: euint256(encrypted_value)
   maxAge: euint256(encrypted_value)
   ...

3. Smart Contract FHE Computation:
   if (age >= minAge AND age <= maxAge):
     if (gender matches):
       if (bmi in range):
         if (condition matches):
           eligible = true

4. All comparisons on ENCRYPTED values! 🔒
5. Result remains encrypted until YOU decrypt it
```

---

## 📊 Understanding the Results

### Eligible Status ✅

If you see **"✅ ELIGIBLE for this trial"**:
- Your encrypted data matches the trial's encrypted criteria
- The FHE computation returned `true`
- You may qualify for this clinical trial

### Not Eligible Status ❌

If you see **"❌ NOT ELIGIBLE for this trial"**:
- Your data doesn't match the criteria
- The FHE computation returned `false`
- Try checking other trials!

### Privacy Guarantee

**Important:** The trial sponsor **NEVER sees your medical data**! They only learn that you're eligible (if you choose to tell them). Your information remains completely private! 🔒

---

## 🧪 Common Test Scenarios

### Scenario 1: Perfect Match

**Patient:** John (Age 45, Diabetes E11, BMI 28.5)
**Trial:** Diabetes Study (Age 18-65, Condition E11, BMI 18.5-35)

**Result:** ✅ ELIGIBLE
**Why:** All criteria match

### Scenario 2: Age Mismatch

**Patient:** Jane (Age 75, Diabetes E11, BMI 22.0)
**Trial:** Diabetes Study (Age 18-65, Condition E11, BMI 18.5-35)

**Result:** ❌ NOT ELIGIBLE
**Why:** Age 75 > max age 65

### Scenario 3: No Condition

**Patient:** Bob (Age 50, No Condition, BMI 25.0)
**Trial:** Diabetes Study (Requires E11, Age 18-65)

**Result:** ❌ NOT ELIGIBLE
**Why:** Trial requires diabetes (E11), Bob has no condition

### Scenario 4: All Healthy Trial

**Patient:** Jane (Age 30, No Condition, BMI 22.0)
**Trial:** Wellness Study (Age 18-65, No Condition, BMI 18.5-30)

**Result:** ✅ ELIGIBLE
**Why:** Perfect match for healthy trial

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to wallet"

**Solutions:**
1. Ensure MetaMask is installed and unlocked
2. Refresh the page
3. Check you're on a supported network (Sepolia)
4. Try clicking "Connect Wallet" again

### Problem: "Transaction failed"

**Solutions:**
1. Check you have enough Sepolia ETH
2. Get more from [sepoliafaucet.com](https://sepoliafaucet.com/)
3. Verify gas price is not too low
4. Check contract address is correct in .env

### Problem: "FHE initialization failed"

**Solutions:**
1. Wait 5-10 seconds for Zama FHE SDK to load
2. Check browser console for errors (F12)
3. Ensure internet connection is stable
4. Try refreshing the page

### Problem: "Eligibility computation failed"

**Solutions:**
1. Ensure you're registered as a patient
2. Verify the trial exists
3. Check you have enough ETH for gas
4. Try switching to a different trial

### Problem: "Cannot decrypt result"

**Solutions:**
1. Only the patient can decrypt their own result
2. Ensure you're using the correct wallet address
3. Check that computation was completed successfully
4. Make sure to sign the EIP-712 message

---

## 💡 Pro Tips

### Tip 1: Save Your ETH

Gas costs on Sepolia are very low, but you can:
- Use [Sepolia Faucet](https://sepoliafaucet.com/) to get free ETH
- Batch multiple operations in one transaction (future feature)

### Tip 2: Test Different Scenarios

Try registering different patients with various:
- Ages (18, 30, 50, 70)
- BMIs (18.5, 25.0, 35.0)
- Medical conditions (E11, I10, Z00)

See how they match against different trials!

### Tip 3: Explore the Blockchain

View your transactions on [Sepolia Etherscan](https://sepolia.etherscan.io/):
- Search for your wallet address
- See all your transactions
- View contract calls and events

**Contract Address:** `0x86eC51d826Ac059d97D44E8c30FF7F0c7AdC35c3`

### Tip 4: Enable Debug Mode

Set in `.env`:
```bash
NEXT_PUBLIC_DEBUG=true
```

Then check browser console (F12) for detailed logs!

---

## 📚 Next Steps

Congratulations! You've successfully:
- ✅ Connected your wallet
- ✅ Registered as a patient (or created a trial)
- ✅ Checked eligibility using FHE
- ✅ Decrypted your private result

### Learn More:

- **Read the [README.md](README.md)** - Complete documentation
- **Explore [app/docs](http://localhost:3000/docs)** - In-depth guides
- **Check out the [test data](README.md#-test-data)** - More examples
- **Understand [security](SECURITY.md)** - How privacy works

### Advanced Features:

- **Multiple Trials** - Check eligibility against many trials
- **Trial Management** - Deactivate or update trials (trial sponsor)
- **Event Tracking** - View all on-chain events

---

## 🎓 Key Concepts

### What is FHE?

**Fully Homomorphic Encryption (FHE)** allows computations on **encrypted data** without decrypting it first!

**Traditional Approach:**
```
Plaintext Data → Compute → Plaintext Result
```

**FHE Approach (AegisCare):**
```
Encrypted Data → Compute on Encrypted Data → Encrypted Result
                                            ↓
                                      Private Decryption (by patient)
                                            ↓
                                         Plaintext Result
```

### Why This Matters

**Privacy:**
- Medical data **never revealed in plaintext**
- Trial sponsors learn **nothing** about patient data
- Only patients see their own results

**Compliance:**
- **HIPAA compliant** - No PHI disclosure
- **GDPR compliant** - Data protection by design
- **Regulatory friendly** - Privacy-first architecture

**Trust:**
- **Zero-trust architecture** - No need to trust intermediaries
- **Verifiable** - All computations on-chain
- **Transparent** - Open source, auditable

---

## 🚀 Going Further

### Deploy Your Own Contract

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Update .env with new contract address
NEXT_PUBLIC_AEGISCARE_ADDRESS=0x...
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test
npx hardhat test test/AegisCare.fhe.test.ts

# Run with gas reporting
REPORT_GAS=true npm test
```

### Explore the Code

- **contracts/AegisCare.sol** - Smart contract (700+ lines)
- **lib/fheClient.ts** - FHE encryption utilities (500+ lines)
- **lib/contractInteractions.ts** - Contract interaction layer (300+ lines)
- **app/** - Next.js pages and components

---

## 💬 Getting Help

### Stuck? We're here to help!

1. **Check the [README.md](README.md)** - Comprehensive documentation
2. **Read [troubleshooting section](#-troubleshooting)** above
3. **Visit [Zama FHE docs](https://docs.zama.ai/)** - FHE resources
4. **Join [Zama Discord](https://discord.gg/CEzpKz3CkH)** - Community support
5. **Open a [GitHub issue](https://github.com/your-repo/issues)** - Bug reports

---

## 🎉 You're Ready!

Congratulations! You now know how to:

- ✅ Set up and run AegisCare
- ✅ Register patients with encrypted medical data
- ✅ Create clinical trials with encrypted criteria
- ✅ Check eligibility using FHE (zero-knowledge!)
- ✅ Decrypt private results securely

**Start exploring the future of privacy-preserving healthcare!** 🚀

---

<div align="center">

**Built with ❤️ using Zama FHEVM**

**Privacy-Preserving Clinical Trial Matching**

**[← Back to README](README.md)**

</div>
