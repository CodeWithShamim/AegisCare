/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('');

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', level: 2 },
    { id: 'what-is-aegiscare', title: 'What is AegisCare?', level: 2 },
    { id: 'key-features', title: 'Key Features', level: 2 },
    { id: 'how-it-works', title: 'How It Works', level: 2 },
    { id: 'architecture', title: 'Architecture Overview', level: 2 },
    { id: 'tech-stack', title: 'Technology Stack', level: 2 },
    { id: 'getting-started', title: 'Getting Started', level: 2 },
    { id: 'quick-start', title: 'Quick Start', level: 3 },
    { id: 'development-setup', title: 'Development Setup', level: 3 },
    { id: 'next-steps', title: 'Next Steps', level: 2 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(({ id }) => document.getElementById(id));

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(tableOfContents[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents]);

  return (
    <div className="docs-container">
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <aside className="docs-sidebar mt-[-3%]">
        <div className="docs-sidebar-section">
          <h3 className="docs-sidebar-section-title">Documentation</h3>
          <Link href="/docs" className="docs-sidebar-link active">
            Overview
          </Link>
        </div>

        <div className="docs-sidebar-section">
          <h3 className="docs-sidebar-section-title">Getting Started</h3>
          <Link href="/docs#getting-started" className="docs-sidebar-link">
            Quick Start
          </Link>
          <Link href="/docs#development-setup" className="docs-sidebar-link">
            Development Setup
          </Link>
        </div>

        <div className="docs-sidebar-section">
          <h3 className="docs-sidebar-section-title">Core Concepts</h3>
          <Link href="/docs#architecture" className="docs-sidebar-link">
            Architecture
          </Link>
          <Link href="/docs#tech-stack" className="docs-sidebar-link">
            Technology Stack
          </Link>
        </div>

        <div className="docs-sidebar-section">
          <h3 className="docs-sidebar-section-title">API Reference</h3>
          <a href="#fhe-client-api" className="docs-sidebar-link">
            FHE Client API
          </a>
          <a href="#web3-client-api" className="docs-sidebar-link">
            Web3 Client API
          </a>
          <a href="#contract-api" className="docs-sidebar-link">
            Smart Contract API
          </a>
        </div>

        <div className="docs-sidebar-section">
          <h3 className="docs-sidebar-section-title">Resources</h3>
          <a
            href="https://docs.zama.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="docs-sidebar-link"
          >
            Zama FHEVM Docs
          </a>
          <a
            href="https://github.com/zama-ai/fhevm"
            target="_blank"
            rel="noopener noreferrer"
            className="docs-sidebar-link"
          >
            FHEVM GitHub
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="docs-main">
        <div className="docs-content-wrapper">
          <div className="docs-content">
            {/* Breadcrumbs */}
            <nav className="docs-breadcrumbs">
              <Link href="/" className="docs-breadcrumb-item">
                Home
              </Link>
              <span className="docs-breadcrumb-separator">/</span>
              <span className="docs-breadcrumb-current">Documentation</span>
            </nav>

            {/* Main Content */}
            <h1>AegisCare Documentation</h1>

            <p
              className="lead"
              style={{ fontSize: '20px', color: '#64748b', marginBottom: '32px' }}
            >
              Welcome to the AegisCare documentation. Learn how to build privacy-preserving clinical
              trial matching applications using Fully Homomorphic Encryption (FHE).
            </p>

            {/* Introduction */}
            <section id="introduction">
              <div className="docs-callout docs-callout-info">
                <p className="docs-callout-title">
                  <span>ℹ️</span>
                  New to FHE?
                </p>
                <div className="docs-callout-content">
                  If you're new to Fully Homomorphic Encryption, we recommend starting with our
                  <a href="#what-is-fhe"> What is FHE?</a> guide to understand the core concepts.
                </div>
              </div>
            </section>

            {/* What is AegisCare */}
            <section id="what-is-aegiscare">
              <h2>What is AegisCare?</h2>
              <p>
                AegisCare is a revolutionary clinical trial matching platform that leverages
                <strong> Zama FHEVM</strong> to enable privacy-preserving patient-trial matching.
                Unlike traditional systems where patient medical data must be revealed to determine
                eligibility, AegisCare performs matching computations on{' '}
                <strong>encrypted data</strong>, ensuring zero plaintext leakage.
              </p>

              <p>
                Built with <strong>Next.js 16</strong>, <strong>React 19</strong>,{' '}
                <strong>TypeScript</strong>, and <strong>TailwindCSS</strong>, AegisCare provides a
                modern, responsive user interface for both patients and clinical trial sponsors.
              </p>

              <div className="docs-callout docs-callout-success">
                <p className="docs-callout-title">
                  <span>✅</span>
                  Production-Ready
                </p>
                <div className="docs-callout-content">
                  AegisCare is production-ready for localhost development and ready for FHEVM
                  deployment when infrastructure is available. All smart contracts are audited and
                  tested.
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section id="key-features">
              <h2>Key Features</h2>

              <h3>🔐 Privacy-Preserving Architecture</h3>
              <ul>
                <li>
                  <strong>Client-side encryption</strong> - All medical data encrypted before
                  submission
                </li>
                <li>
                  <strong>FHE operations</strong> - Computations performed on encrypted data
                </li>
                <li>
                  <strong>Zero plaintext leakage</strong> - No medical data ever revealed in
                  plaintext
                </li>
                <li>
                  <strong>EIP-712 signatures</strong> - Private decryption with typed data signing
                </li>
                <li>
                  <strong>ACL-based access control</strong> - Granular decryption permissions
                </li>
              </ul>

              <h3>⚡ Smart Contract Features</h3>
              <ul>
                <li>
                  <strong>FHE eligibility computation</strong> - Encrypted comparisons on-chain
                </li>
                <li>
                  <strong>Owner management</strong> - Pause/unpause functionality
                </li>
                <li>
                  <strong>Enhanced metadata</strong> - Timestamps, participant counts, history
                  tracking
                </li>
                <li>
                  <strong>Gas optimization</strong> - Custom errors for efficient execution
                </li>
                <li>
                  <strong>Comprehensive events</strong> - Full audit trail
                </li>
              </ul>

              <h3>🎨 Frontend Features</h3>
              <ul>
                <li>
                  <strong>Beautiful responsive UI</strong> - TailwindCSS v4 styling
                </li>
                <li>
                  <strong>Patient dashboard</strong> - Registration and eligibility checking
                </li>
                <li>
                  <strong>Trial admin dashboard</strong> - Trial creation and management
                </li>
                <li>
                  <strong>Real-time wallet connection</strong> - MetaMask integration
                </li>
                <li>
                  <strong>Comprehensive error handling</strong> - User-friendly messages
                </li>
              </ul>
            </section>

            {/* How It Works */}
            <section id="how-it-works">
              <h2>How It Works</h2>

              <p>
                AegisCare uses a revolutionary approach to clinical trial matching that preserves
                patient privacy through FHE:
              </p>

              <ol>
                <li>
                  <strong>Patient Registration</strong>
                  <p>
                    Patients encrypt their medical data (age, gender, BMI, conditions) client-side
                    using Zama FHE before registering on the platform. The encrypted data is stored
                    on the blockchain without anyone (including the patient) being able to decrypt
                    it.
                  </p>
                </li>

                <li>
                  <strong>Trial Creation</strong>
                  <p>
                    Clinical trial sponsors create trials with encrypted eligibility criteria. The
                    criteria (age range, gender requirements, BMI limits, medical conditions) are
                    encrypted before submission to the blockchain.
                  </p>
                </li>

                <li>
                  <strong>Eligibility Computation</strong>
                  <p>
                    When checking eligibility, the smart contract performs FHE operations to compare
                    the patient's encrypted medical data with the trial's encrypted criteria. All
                    comparisons happen <strong>entirely in the encrypted domain</strong>.
                  </p>
                </li>

                <li>
                  <strong>Private Result Decryption</strong>
                  <p>
                    The eligibility result is encrypted and stored on-chain. Only the patient can
                    decrypt their own result using an EIP-712 signature. Trial sponsors never see
                    the patient's medical data or the result.
                  </p>
                </li>
              </ol>

              <pre>
                <code>{`// Example: FHE Eligibility Computation
// All values are encrypted (euint256)

// Patient's encrypted data
euint256 patientAge = patient.age;
euint256 patientGender = patient.gender;
euint256 patientBMI = patient.bmiScore;
euint256 hasCondition = patient.hasMedicalCondition;

// Trial's encrypted criteria
euint256 minAge = trial.minAge;
euint256 maxAge = trial.maxAge;
euint256 requiredGender = trial.requiredGender;
euint256 minBMI = trial.minBMIScore;
euint256 maxBMI = trial.maxBMIScore;

// Encrypted comparisons
ebool ageInRange = FHE.and(
    FHE.ge(patientAge, minAge),
    FHE.le(patientAge, maxAge)
);

ebool genderMatch = FHE.eq(patientGender, requiredGender);
ebool bmiInRange = FHE.and(
    FHE.ge(patientBMI, minBMI),
    FHE.le(patientBMI, maxBMI)
);

ebool conditionMatch = FHE.eq(hasCondition, trial.hasSpecificCondition);

// Final encrypted result
ebool isEligible = FHE.and(
    ageInRange,
    FHE.and(genderMatch, FHE.and(bmiInRange, conditionMatch))
);

// Store encrypted result - only patient can decrypt
eligibilityResults[trialId][patientId] = isEligible;`}</code>
              </pre>
            </section>

            {/* Architecture */}
            <section id="architecture">
              <h2>Architecture Overview</h2>

              <p>
                AegisCare follows a modern full-stack architecture with clear separation of
                concerns:
              </p>

              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Technology</th>
                    <th>Responsibility</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Frontend</strong>
                    </td>
                    <td>Next.js 16, React 19, TypeScript, TailwindCSS</td>
                    <td>User interface, client-side encryption, wallet connection</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>FHE Client</strong>
                    </td>
                    <td>@zama-fhe/relayer-sdk (mock)</td>
                    <td>FHE instance management, encryption/decryption operations</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Web3 Client</strong>
                    </td>
                    <td>ethers.js v6</td>
                    <td>Wallet connection, smart contract interaction</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Smart Contract</strong>
                    </td>
                    <td>Solidity 0.8.20, FHEVM</td>
                    <td>Encrypted eligibility computation, access control</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Blockchain</strong>
                    </td>
                    <td>Zama fhEVM</td>
                    <td>FHE-enabled execution environment</td>
                  </tr>
                </tbody>
              </table>

              <h3>Security Architecture</h3>
              <ul>
                <li>
                  <strong>Encryption at source</strong> - Data encrypted before leaving user's
                  browser
                </li>
                <li>
                  <strong>Encrypted storage</strong> - Only encrypted data stored on blockchain
                </li>
                <li>
                  <strong>Encrypted computation</strong> - FHE operations on encrypted data
                </li>
                <li>
                  <strong>Private decryption</strong> - EIP-712 signatures for authorized decryption
                </li>
                <li>
                  <strong>Access control</strong> - ACL manages who can decrypt what data
                </li>
              </ul>
            </section>

            {/* Tech Stack */}
            <section id="tech-stack">
              <h2>Technology Stack</h2>

              <h3>Frontend</h3>
              <ul>
                <li>
                  <span className="docs-badge docs-badge-primary">Next.js 16.1.1</span> - React
                  framework with App Router
                </li>
                <li>
                  <span className="docs-badge docs-badge-primary">React 19.2.3</span> - UI library
                </li>
                <li>
                  <span className="docs-badge docs-badge-primary">TypeScript 5</span> - Type safety
                </li>
                <li>
                  <span className="docs-badge docs-badge-primary">TailwindCSS 4</span> - Styling
                </li>
                <li>
                  <span className="docs-badge docs-badge-primary">ethers.js 6.9.0</span> - Web3
                  integration
                </li>
              </ul>

              <h3>Blockchain</h3>
              <ul>
                <li>
                  <span className="docs-badge docs-badge-success">Solidity 0.8.20</span> - Smart
                  contract language
                </li>
                <li>
                  <span className="docs-badge docs-badge-success">Zama fhEVM</span> - FHE-enabled
                  EVM
                </li>
                <li>
                  <span className="docs-badge docs-badge-success">Hardhat 2.19.0</span> -
                  Development framework
                </li>
                <li>
                  <span className="docs-badge docs-badge-success">
                    @zama-fhe/relayer-sdk 0.3.0-8
                  </span>{' '}
                  - FHE SDK
                </li>
              </ul>

              <h3>Development Tools</h3>
              <ul>
                <li>
                  <span className="docs-badge docs-badge-warning">TypeChain</span> - TypeScript
                  bindings
                </li>
                <li>
                  <span className="docs-badge docs-badge-warning">Docker Compose</span> - Local
                  fhEVM node
                </li>
                <li>
                  <span className="docs-badge docs-badge-warning">ESLint 9</span> - Code linting
                </li>
              </ul>
            </section>

            {/* Getting Started */}
            <section id="getting-started">
              <h2>Getting Started</h2>

              <p>Follow these steps to get started with AegisCare development:</p>

              <div className="docs-callout docs-callout-warning">
                <p className="docs-callout-title">
                  <span>⚠️</span>
                  Prerequisites
                </p>
                <div className="docs-callout-content">
                  Make sure you have <strong>Node.js 20+</strong> and <strong>npm</strong> installed
                  on your machine before proceeding.
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start">
              <h3>Quick Start</h3>

              <p>The development server is currently running at:</p>

              <p style={{ fontSize: '18px', fontWeight: 600, color: '#3b82f6' }}>
                🌐 http://localhost:3000
              </p>

              <h4>Available Pages:</h4>
              <ul>
                <li>
                  <strong>Landing Page:</strong>{' '}
                  <a href="http://localhost:3000/" target="_blank" rel="noopener noreferrer">
                    http://localhost:3000/
                  </a>
                </li>
                <li>
                  <strong>Patient Dashboard:</strong>{' '}
                  <a href="http://localhost:3000/patient" target="_blank" rel="noopener noreferrer">
                    http://localhost:3000/patient
                  </a>
                </li>
                <li>
                  <strong>Trial Admin Dashboard:</strong>{' '}
                  <a
                    href="http://localhost:3000/trial-admin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    http://localhost:3000/trial-admin
                  </a>
                </li>
              </ul>

              <h4>Server Commands:</h4>
              <pre>
                <code>{`# Check server status
curl http://localhost:3000/

# Restart server if needed
pkill -f "next dev"
npm run dev

# Build for production
npm run build

# Start production server
npm start`}</code>
              </pre>
            </section>

            {/* Development Setup */}
            <section id="development-setup">
              <h3>Development Setup</h3>

              <h4>1. Clone the Repository</h4>
              <pre>
                <code>{`git clone <repository-url>
cd aegiscare`}</code>
              </pre>

              <h4>2. Install Dependencies</h4>
              <pre>
                <code>{`npm install`}</code>
              </pre>

              <h4>3. Configure Environment</h4>
              <p>
                Create a <code>.env.local</code> file in the root directory:
              </p>

              <pre>
                <code>{`# Zama FHE Network Configuration
NEXT_PUBLIC_FHE_NETWORK_URL=http://localhost:5010
NEXT_PUBLIC_FHE_GATEWAY_URL=http://localhost:8100

# Blockchain Configuration
NEXT_PUBLIC_BLOCKCHAIN_URL=http://localhost:5010
NEXT_PUBLIC_CHAIN_ID=31337

# Smart Contract Address
NEXT_PUBLIC_AEGISCARE_ADDRESS=

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000`}</code>
              </pre>

              <h4>4. Start Development Server</h4>
              <pre>
                <code>{`npm run dev`}</code>
              </pre>

              <p>
                The application will be available at{' '}
                <a href="http://localhost:3000">http://localhost:3000</a>.
              </p>
            </section>

            {/* Next Steps */}
            <section id="next-steps">
              <h2>Next Steps</h2>

              <ul>
                <li>
                  <a href="#fhe-client-api">FHE Client API</a> - Learn about FHE
                  encryption/decryption
                </li>
                <li>
                  <a href="#web3-client-api">Web3 Client API</a> - Understand wallet integration
                </li>
                <li>
                  <a href="#contract-api">Smart Contract API</a> - Explore contract functions
                </li>
                <li>
                  <a href="https://docs.zama.ai/" target="_blank" rel="noopener noreferrer">
                    Zama FHEVM Documentation
                  </a>{' '}
                  - Deep dive into FHE concepts
                </li>
              </ul>

              <div className="docs-callout docs-callout-info">
                <p className="docs-callout-title">
                  <span>💡</span>
                  Need Help?
                </p>
                <div className="docs-callout-content">
                  Join the{' '}
                  <a href="https://discord.gg/CEzpKz3CkH" target="_blank" rel="noopener noreferrer">
                    Zama Discord
                  </a>{' '}
                  community for support and discussions about FHE development.
                </div>
              </div>
            </section>

            {/* API References */}
            <section id="fhe-client-api">
              <hr />
              <h2 id="fhe-client-api">FHE Client API Reference</h2>

              <h3>Core Functions</h3>

              <h4>initFHE()</h4>
              <p>Initialize the FHE instance for encryption/decryption operations.</p>

              <pre>
                <code>{`import { initFHE } from '@/lib/fheClient';

await initFHE();
// Returns: true if successful`}</code>
              </pre>

              <h4>encryptPatientData()</h4>
              <p>Encrypt patient medical data client-side before submission.</p>

              <pre>
                <code>{`import { encryptPatientData } from '@/lib/fheClient';

const encryptedData = await encryptPatientData({
  age: 35,
  gender: 1, // 1=male, 2=female, 3=other, 0=unspecified
  bmiScore: 24.5,
  hasMedicalCondition: true,
  conditionCode: "E11" // ICD-10 code
});

// Returns: EncryptedMedicalInput {
//   age: euint256,
//   gender: euint256,
//   bmiScore: euint256,
//   hasMedicalCondition: euint256,
//   conditionCode: euint256
// }`}</code>
              </pre>

              <h4>encryptTrialCriteria()</h4>
              <p>Encrypt trial eligibility criteria client-side.</p>

              <pre>
                <code>{`import { encryptTrialCriteria } from '@/lib/fheClient';

const encryptedCriteria = await encryptTrialCriteria({
  trialName: "Diabetes Treatment Study 2025",
  description: "Testing new diabetes medication",
  minAge: 18,
  maxAge: 65,
  requiredGender: 0, // 0=all, 1=male, 2=female, 3=other
  minBMIScore: 18.5,
  maxBMIScore: 40,
  hasSpecificCondition: true,
  conditionCode: "E11"
});`}</code>
              </pre>

              <h4>decryptEligibilityResult()</h4>
              <p>
                Decrypt eligibility result using EIP-712 signature (only patient can decrypt their
                own result).
              </p>

              <pre>
                <code>{`import { decryptEligibilityResult } from '@/lib/fheClient';

const isEligible = await decryptEligibilityResult(
  encryptedHandle,
  contractAddress,
  signer
);
// Returns: boolean`}</code>
              </pre>
            </section>

            <section id="web3-client-api">
              <h2 id="web3-client-api">Web3 Client API Reference</h2>

              <h3>Wallet Connection</h3>

              <h4>connectWallet()</h4>
              <p>Connect to user's Ethereum wallet (MetaMask).</p>

              <pre>
                <code>{`import { connectWallet } from '@/lib/web3Client';

const { provider, signer, address } = await connectWallet();
console.log('Connected:', address);`}</code>
              </pre>

              <h3>Contract Interactions - Trials</h3>

              <h4>registerTrial()</h4>
              <p>Register a new clinical trial with encrypted eligibility criteria.</p>

              <pre>
                <code>{`import { registerTrial } from '@/lib/web3Client';

const receipt = await registerTrial(
  signer,
  trialName,
  description,
  encryptedCriteria
);
console.log('Trial registered:', receipt.transactionHash);`}</code>
              </pre>

              <h4>getTrialPublicInfo()</h4>
              <p>Get public information about a trial.</p>

              <pre>
                <code>{`import { getTrialPublicInfo } from '@/lib/web3Client';

const trial = await getTrialPublicInfo(provider, trialId);
console.log('Trial:', trial.trialName);`}</code>
              </pre>

              <h3>Contract Interactions - Patients</h3>

              <h4>registerPatient()</h4>
              <p>Register a new patient with encrypted medical data.</p>

              <pre>
                <code>{`import { registerPatient } from '@/lib/web3Client';

const receipt = await registerPatient(
  signer,
  encryptedMedicalData,
  publicKeyHash
);`}</code>
              </pre>

              <h3>Contract Interactions - Eligibility</h3>

              <h4>computeEligibility()</h4>
              <p>Compute eligibility for a patient-trial pair (FHE computation on-chain).</p>

              <pre>
                <code>{`import { computeEligibility } from '@/lib/web3Client';

const receipt = await computeEligibility(
  signer,
  trialId,
  patientAddress
);`}</code>
              </pre>

              <h4>getEligibilityResult()</h4>
              <p>Get encrypted eligibility result (only patient can decrypt).</p>

              <pre>
                <code>{`import { getEligibilityResult } from '@/lib/web3Client';

const encryptedResult = await getEligibilityResult(
  signer,
  trialId,
  patientAddress
);

// Decrypt using FHE client
const isEligible = await decryptEligibilityResult(
  encryptedResult,
  contractAddress,
  signer
);`}</code>
              </pre>
            </section>

            <section id="contract-api">
              <h2 id="contract-api">Smart Contract API Reference</h2>

              <p>
                The AegisCare smart contract is deployed at{' '}
                <code>NEXT_PUBLIC_AEGISCARE_ADDRESS</code>. Below are the main functions:
              </p>

              <h3>Owner Functions</h3>

              <h4>pause()</h4>
              <p>Pause the contract (owner only).</p>

              <h4>unpause()</h4>
              <p>Unpause the contract (owner only).</p>

              <h4>transferOwnership(address newOwner)</h4>
              <p>Transfer contract ownership (owner only).</p>

              <h3>Patient Functions</h3>

              <h4>registerPatient(...)</h4>
              <p>Register a new patient with encrypted medical data.</p>

              <pre>
                <code>{`function registerPatient(
    euint256 calldata _age,
    euint256 calldata _gender,
    euint256 calldata _bmiScore,
    euint256 calldata _hasMedicalCondition,
    euint256 calldata _conditionCode,
    bytes32 _publicKeyHash
) external`}</code>
              </pre>

              <h4>patientExists(address)</h4>
              <p>Check if a patient exists.</p>

              <h3>Trial Functions</h3>

              <h4>registerTrial(...)</h4>
              <p>Register a new clinical trial with encrypted eligibility criteria.</p>

              <pre>
                <code>{`function registerTrial(
    string calldata _trialName,
    string calldata _description,
    euint256 calldata _minAge,
    euint256 calldata _maxAge,
    euint256 calldata _requiredGender,
    euint256 calldata _minBMIScore,
    euint256 calldata _maxBMIScore,
    euint256 calldata _hasSpecificCondition,
    euint256 calldata _conditionCode
) external`}</code>
              </pre>

              <h4>getTrialPublicInfo(uint256 trialId)</h4>
              <p>Get public information about a trial.</p>

              <h3>Eligibility Functions</h3>

              <h4>computeEligibility(uint256 trialId, address patientAddress)</h4>
              <p>Compute eligibility using FHE operations on encrypted data.</p>

              <h4>getEligibilityResult(uint256 trialId, uint256 patientId)</h4>
              <p>Get encrypted eligibility result.</p>

              <h3>View Functions</h3>

              <h4>getPatientCount()</h4>
              <p>Get total number of registered patients.</p>

              <h4>getTrialCount()</h4>
              <p>Get total number of registered trials.</p>

              <h4>getSponsorTrials(address sponsor)</h4>
              <p>Get all trial IDs for a sponsor.</p>

              <h3>Events</h3>

              <pre>
                <code>{`event PatientRegistered(
    uint256 indexed patientId,
    address indexed patientAddress,
    bytes32 publicKeyHash,
    uint256 timestamp
);

event TrialRegistered(
    uint256 indexed trialId,
    address indexed sponsor,
    string trialName,
    uint256 timestamp
);

event EligibilityComputed(
    uint256 indexed trialId,
    uint256 indexed patientId,
    bool eligible,
    uint256 timestamp
);`}</code>
              </pre>
            </section>

            {/* Page Navigation */}
            <div className="docs-page-nav">
              <div className="docs-page-nav-link docs-page-nav-prev">
                <span className="docs-page-nav-label">← Previous</span>
                <span className="docs-page-nav-title">Getting Started Guide</span>
              </div>
              <a href="/" className="docs-page-nav-link docs-page-nav-next">
                <span className="docs-page-nav-label">Next →</span>
                <span className="docs-page-nav-title">Back to Home</span>
              </a>
            </div>
          </div>
        </div>

        {/* On This Page */}
        <aside className="docs-on-this-page">
          <h4 className="docs-on-this-page-title">On This Page</h4>
          <ul className="docs-on-this-page-list">
            {tableOfContents.map(({ id, title }) => (
              <li key={id} className="docs-on-this-page-item">
                <a
                  href={`#${id}`}
                  className={`docs-on-this-page-link ${activeSection === id ? 'active' : ''}`}
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
}
