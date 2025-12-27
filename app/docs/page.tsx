/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('');

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', level: 2 },
    { id: 'test-data', title: 'Test Data Guide', level: 2 },
    { id: 'patient-data', title: 'Sample Patients', level: 3 },
    { id: 'trial-data', title: 'Sample Trials', level: 3 },
    { id: 'medical-codes', title: 'Medical Codes', level: 3 },
    { id: 'how-it-works', title: 'How It Works', level: 2 },
    { id: 'patient-workflow', title: 'Patient Workflow', level: 3 },
    { id: 'trial-workflow', title: 'Trial Sponsor Workflow', level: 3 },
    { id: 'eligibility-workflow', title: 'Eligibility Workflow', level: 3 },
    { id: 'architecture', title: 'Architecture', level: 2 },
    { id: 'tech-stack', title: 'Technology Stack', level: 2 },
    { id: 'api-reference', title: 'API Reference', level: 2 },
    { id: 'fhe-api', title: 'FHE Client API', level: 3 },
    { id: 'web3-api', title: 'Web3 Client API', level: 3 },
    { id: 'contract-api', title: 'Smart Contract API', level: 3 },
    { id: 'troubleshooting', title: 'Troubleshooting', level: 2 },
    { id: 'security', title: 'Security & Privacy', level: 2 },
    { id: 'deployment', title: 'Deployment', level: 2 },
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
      <Header />

      <aside className="docs-sidebar mt-[-3%]">
        <div className="docs-sidebar-section">
          <h3 className="docs-sidebar-section-title">Documentation</h3>
          <Link href="/docs" className="docs-sidebar-link active">
            Overview
          </Link>
        </div>

        <div className="docs-sidebar-section">
          <h3 className="docs-sidebar-section-title">Quick Links</h3>
          <Link href="/docs#test-data" className="docs-sidebar-link">
            📊 Test Data
          </Link>
          <Link href="/docs#how-it-works" className="docs-sidebar-link">
            🚀 How It Works
          </Link>
          <Link href="/docs#troubleshooting" className="docs-sidebar-link">
            🐛 Troubleshooting
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
          <Link href="/docs#security" className="docs-sidebar-link">
            Security & Privacy
          </Link>
        </div>

        <div className="docs-sidebar-section">
          <h3 className="docs-sidebar-section-title">API Reference</h3>
          <Link href="/docs#api-reference" className="docs-sidebar-link">
            API Overview
          </Link>
          <a href="#fhe-api" className="docs-sidebar-link">
            FHE Client API
          </a>
          <a href="#web3-api" className="docs-sidebar-link">
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
            href="https://sepolia.etherscan.io/address/0xe790E247C5793AD4EDDE7C1cFd6582b45F603947"
            target="_blank"
            rel="noopener noreferrer"
            className="docs-sidebar-link"
          >
            Contract on Etherscan
          </a>
          <Link href="/QUICKSTART.md" className="docs-sidebar-link">
            Quick Start Guide
          </Link>
        </div>
      </aside>

      <main className="docs-content">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section id="introduction" className="docs-section mb-16">
            <h2 className="docs-section-title">Introduction to AegisCare</h2>

            <div className="docs-card">
              <h3 className="text-xl font-bold mb-4">🛡️ What is AegisCare?</h3>
              <p className="mb-4">
                <strong>AegisCare</strong> is a revolutionary clinical trial matching platform that uses
                <strong> Fully Homomorphic Encryption (FHE)</strong> to enable privacy-preserving
                patient-trial matching. Unlike traditional systems, AegisCare performs eligibility
                computations on <strong>encrypted data</strong>, ensuring <strong>zero plaintext leakage</strong>.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="font-semibold">🔒 Privacy Guarantee:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Medical data <strong>never leaves the browser in plaintext</strong></li>
                  <li>Eligibility computed <strong>entirely in the encrypted domain</strong></li>
                  <li><strong>Only the patient</strong> can decrypt their own results</li>
                  <li>Trial sponsors <strong>never see patient medical data</strong></li>
                </ul>
              </div>

              <h4 className="text-lg font-bold mb-2">✨ Key Features</h4>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Client-Side Encryption:</strong> All medical data encrypted before submission</li>
                <li><strong>FHE Operations:</strong> Computations on encrypted data only</li>
                <li><strong>Private Decryption:</strong> EIP-712 signatures for secure access</li>
                <li><strong>Zero Knowledge:</strong> Trial sponsors learn nothing about patient data</li>
                <li><strong>Testnet Deployed:</strong> Live on Sepolia at <code className="bg-gray-100 px-2 py-1 rounded">0xe790E247C5793AD4EDDE7C1cFd6582b45F603947</code></li>
              </ul>
            </div>
          </section>

          {/* Test Data Guide */}
          <section id="test-data" className="docs-section mb-16">
            <h2 className="docs-section-title">📊 Test Data Guide</h2>
            <p className="mb-6 text-lg">
              Use these pre-configured test patients and trials to explore the platform without entering real medical data.
            </p>

            <div className="docs-card">
              <h3 className="text-xl font-bold mb-4">Quick Test Scenarios</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">✅ Perfect Match</h4>
                  <p className="text-sm mb-2"><strong>Patient:</strong> John (Age 45, Diabetes E11, BMI 28.5)</p>
                  <p className="text-sm mb-2"><strong>Trial:</strong> Diabetes Study (Age 18-65, E11, BMI 18.5-35)</p>
                  <p className="text-sm font-semibold text-green-700">Result: ELIGIBLE ✅</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">❌ Age Mismatch</h4>
                  <p className="text-sm mb-2"><strong>Patient:</strong> Jane (Age 75, Diabetes E11, BMI 22.0)</p>
                  <p className="text-sm mb-2"><strong>Trial:</strong> Diabetes Study (Age 18-65, E11, BMI 18.5-35)</p>
                  <p className="text-sm font-semibold text-red-700">Result: NOT ELIGIBLE (too old)</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-2">⚠️ Condition Mismatch</h4>
                  <p className="text-sm mb-2"><strong>Patient:</strong> Bob (Age 50, No Condition, BMI 25.0)</p>
                  <p className="text-sm mb-2"><strong>Trial:</strong> Diabetes Study (Requires E11, Age 18-65)</p>
                  <p className="text-sm font-semibold text-yellow-700">Result: NOT ELIGIBLE (no diabetes)</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">✅ Healthy Trial Match</h4>
                  <p className="text-sm mb-2"><strong>Patient:</strong> Jane (Age 30, No Condition, BMI 22.0)</p>
                  <p className="text-sm mb-2"><strong>Trial:</strong> Wellness Study (Age 18-65, No Condition, BMI 18.5-30)</p>
                  <p className="text-sm font-semibold text-green-700">Result: ELIGIBLE ✅</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sample Patients */}
          <section id="patient-data" className="docs-section mb-16">
            <h3 className="text-2xl font-bold mb-6">Sample Patient Data</h3>

            <div className="space-y-6">
              {/* Patient 1 */}
              <div className="docs-card">
                <h4 className="text-lg font-bold mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">Patient 1</span>
                  John Doe - Diabetes Patient
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="overflow-x-auto text-sm"><code>{`{
  "name": "John Doe",
  "age": 45,
  "gender": 1,
  "bmiScore": 28.5,
  "hasMedicalCondition": true,
  "conditionCode": "E11",
  "description": "Type 2 Diabetes, age 45, BMI 28.5 (overweight)"
}`}</code></pre>
                </div>
                <div className="mt-4">
                  <p className="font-semibold mb-2">Matches:</p>
                  <ul className="list-disc ml-6">
                    <li>✅ Diabetes Treatment Study 2025</li>
                  </ul>
                </div>
              </div>

              {/* Patient 2 */}
              <div className="docs-card">
                <h4 className="text-lg font-bold mb-3 flex items-center">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">Patient 2</span>
                  Jane Smith - Healthy Adult
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="overflow-x-auto text-sm"><code>{`{
  "name": "Jane Smith",
  "age": 32,
  "gender": 2,
  "bmiScore": 22.1,
  "hasMedicalCondition": false,
  "conditionCode": "Z00",
  "description": "Healthy adult, age 32, normal BMI"
}`}</code></pre>
                </div>
                <div className="mt-4">
                  <p className="font-semibold mb-2">Matches:</p>
                  <ul className="list-disc ml-6">
                    <li>✅ General Wellness Study</li>
                  </ul>
                </div>
              </div>

              {/* Patient 3 */}
              <div className="docs-card">
                <h4 className="text-lg font-bold mb-3 flex items-center">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm mr-3">Patient 3</span>
                  Bob Johnson - Hypertension Patient
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="overflow-x-auto text-sm"><code>{`{
  "name": "Bob Johnson",
  "age": 58,
  "gender": 1,
  "bmiScore": 31.2,
  "hasMedicalCondition": true,
  "conditionCode": "I10",
  "description": "Hypertension, age 58, BMI 31.2 (obese)"
}`}</code></pre>
                </div>
                <div className="mt-4">
                  <p className="font-semibold mb-2">Matches:</p>
                  <ul className="list-disc ml-6">
                    <li>✅ Cardiovascular Health Research</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Sample Trials */}
          <section id="trial-data" className="docs-section mb-16">
            <h3 className="text-2xl font-bold mb-6">Sample Trial Data</h3>

            <div className="space-y-6">
              {/* Trial 1 */}
              <div className="docs-card">
                <h4 className="text-lg font-bold mb-3">Trial 1: Diabetes Treatment Study 2025</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <pre className="overflow-x-auto text-sm"><code>{`{
  "trialName": "Diabetes Treatment Study 2025",
  "description": "Testing new treatment for Type 2 diabetes in adults",
  "criteria": {
    "minAge": 18,
    "maxAge": 65,
    "requiredGender": 0,
    "minBMIScore": 18.5,
    "maxBMIScore": 35,
    "hasSpecificCondition": true,
    "conditionCode": "E11"
  }
}`}</code></pre>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-semibold">📊 Eligible Patients:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>John Doe (Age 45, BMI 28.5, E11)</li>
                  </ul>
                </div>
              </div>

              {/* Trial 2 */}
              <div className="docs-card">
                <h4 className="text-lg font-bold mb-3">Trial 2: Cardiovascular Health Research</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <pre className="overflow-x-auto text-sm"><code>{`{
  "trialName": "Cardiovascular Health Research",
  "description": "Study on heart health in adults 40-70",
  "criteria": {
    "minAge": 40,
    "maxAge": 70,
    "requiredGender": 0,
    "minBMIScore": 20,
    "maxBMIScore": 40,
    "hasSpecificCondition": true,
    "conditionCode": "I10"
  }
}`}</code></pre>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-semibold">📊 Eligible Patients:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Bob Johnson (Age 58, BMI 31.2, I10)</li>
                  </ul>
                </div>
              </div>

              {/* Trial 3 */}
              <div className="docs-card">
                <h4 className="text-lg font-bold mb-3">Trial 3: General Wellness Study</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <pre className="overflow-x-auto text-sm"><code>{`{
  "trialName": "General Wellness Study",
  "description": "Open study for healthy adults",
  "criteria": {
    "minAge": 18,
    "maxAge": 65,
    "requiredGender": 0,
    "minBMIScore": 18.5,
    "maxBMIScore": 30,
    "hasSpecificCondition": false,
    "conditionCode": "Z00"
  }
}`}</code></pre>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-semibold">📊 Eligible Patients:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Jane Smith (Age 32, BMI 22.1, Z00)</li>
                    <li>John Doe (if no diabetes - but he has E11, so no match)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Medical Codes Reference */}
          <section id="medical-codes" className="docs-section mb-16">
            <h3 className="text-2xl font-bold mb-6">Medical Codes Reference</h3>

            <div className="docs-card overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">E11</td>
                    <td className="px-6 py-4 text-sm">Type 2 diabetes mellitus</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-800 rounded">Endocrine</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">E10</td>
                    <td className="px-6 py-4 text-sm">Type 1 diabetes mellitus</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-800 rounded">Endocrine</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">I10</td>
                    <td className="px-6 py-4 text-sm">Essential (primary) hypertension</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Circulatory</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">I50</td>
                    <td className="px-6 py-4 text-sm">Heart failure</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Circulatory</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">J45</td>
                    <td className="px-6 py-4 text-sm">Asthma</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Respiratory</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">M54</td>
                    <td className="px-6 py-4 text-sm">Dorsalgia (back pain)</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Musculoskeletal</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">Z00</td>
                    <td className="px-6 py-4 text-sm">General medical examination (healthy)</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-green-100 text-green-800 rounded">Health</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">Z01</td>
                    <td className="px-6 py-4 text-sm">Special examinations and investigations</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-green-100 text-green-800 rounded">Health</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="docs-card mt-6">
              <h4 className="font-bold mb-3">Gender Codes</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">0</td>
                    <td className="px-6 py-4 text-sm">All genders (no preference)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">1</td>
                    <td className="px-6 py-4 text-sm">Male</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">2</td>
                    <td className="px-6 py-4 text-sm">Female</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">3</td>
                    <td className="px-6 py-4 text-sm">Other / Prefer not to say</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="docs-section mb-16">
            <h2 className="docs-section-title">🚀 How It Works</h2>

            <div className="space-y-6">
              <div className="docs-card">
                <h3 className="text-xl font-bold mb-4">Patient Workflow</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">1</div>
                    <div className="flex-1">
                      <p className="font-semibold">Register Medical Data</p>
                      <p className="text-sm text-gray-600">Enter your medical information on the patient dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">2</div>
                    <div className="flex-1">
                      <p className="font-semibold">Client-Side Encryption 🔒</p>
                      <p className="text-sm text-gray-600">Your data is encrypted in the browser using FHE before being sent</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">3</div>
                    <div className="flex-1">
                      <p className="font-semibold">Blockchain Registration</p>
                      <p className="text-sm text-gray-600">Encrypted data stored on Sepolia testnet via smart contract</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">4</div>
                    <div className="flex-1">
                      <p className="font-semibold">Check Eligibility</p>
                      <p className="text-sm text-gray-600">Select a trial and trigger encrypted eligibility computation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">5</div>
                    <div className="flex-1">
                      <p className="font-semibold">Private Decryption 🔑</p>
                      <p className="text-sm text-gray-600">Only YOU can decrypt your result with your private key</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="docs-card">
                <h3 className="text-xl font-bold mb-4">Trial Sponsor Workflow</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-4">1</div>
                    <div className="flex-1">
                      <p className="font-semibold">Create Trial</p>
                      <p className="text-sm text-gray-600">Define trial name, description, and eligibility criteria</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-4">2</div>
                    <div className="flex-1">
                      <p className="font-semibold">Encrypt Criteria 🔒</p>
                      <p className="text-sm text-gray-600">Trial criteria encrypted before being sent to blockchain</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-4">3</div>
                    <div className="flex-1">
                      <p className="font-semibold">Smart Contract Storage</p>
                      <p className="text-sm text-gray-600">Encrypted trial stored on Sepolia testnet</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-4">4</div>
                    <div className="flex-1">
                      <p className="font-semibold">Wait for Patients</p>
                      <p className="text-sm text-gray-600">Patients can now check their eligibility against your trial</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture" className="docs-section mb-16">
            <h2 className="docs-section-title">🏗️ Architecture Overview</h2>

            <div className="docs-card">
              <h3 className="text-xl font-bold mb-4">System Architecture</h3>
              <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm">
                <pre><code>{`┌─────────────────────────────────────────┐
│           Patient Browser                 │
│  ┌──────────────────────────────────┐   │
│  │ Medical Data (Plaintext)         │   │
│  └────────────┬─────────────────────┘   │
│               │                          │
│               ▼                          │
│  ┌──────────────────────────────────┐   │
│  │ FHE Encryption (Client-Side)    │   │
│  │ • Zama RelayerSDK v0.3.0-8      │   │
│  │ • Encrypted handles + proofs     │   │
│  └────────────┬─────────────────────┘   │
└───────────────┼──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│     Ethereum Sepolia Testnet            │
│  ┌──────────────────────────────────┐   │
│  │ AegisCare Smart Contract          │   │
│  │ 0xe790E...45F603947             │   │
│  │                                  │   │
│  │ • Encrypted Patient Data         │   │
│  │ • Encrypted Trial Criteria       │   │
│  │ • FHE Eligibility Computation    │   │
│  │ • Encrypted Results Storage      │   │
│  └────────────┬─────────────────────┘   │
└───────────────┼──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│      EIP-712 Private Decryption         │
│  ┌──────────────────────────────────┐   │
│  │ Patient Signs EIP-712 Message   │   │
│  │ → Private Key Decrypts Result   │   │
│  └────────────┬─────────────────────┘   │
└───────────────┼──────────────────────────┘
                │
                ▼
         ┌──────────┐
         │ ELIGIBLE │
         │ YES / NO │
         └─────────┘`}</code></pre>
              </div>

              <div className="mt-6">
                <h4 className="font-bold mb-2">Key Components:</h4>
                <ul className="space-y-2">
                  <li><strong>Frontend:</strong> Next.js 16, React 19, TypeScript, TailwindCSS 4</li>
                  <li><strong>FHE SDK:</strong> Zama RelayerSDK v0.3.0-8 for client-side encryption</li>
                  <li><strong>Web3:</strong> ethers.js v6, Wagmi for wallet connection</li>
                  <li><strong>Blockchain:</strong> Solidity 0.8.27, fhEVM, Sepolia testnet</li>
                  <li><strong>Smart Contract:</strong> AegisCare.sol with FHE operations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference" className="docs-section mb-16">
            <h2 className="docs-section-title">📚 API Reference</h2>

            <div id="fhe-api" className="docs-card mb-6">
              <h3 className="text-xl font-bold mb-4">FHE Client API</h3>
              <p className="mb-4">Client-side encryption utilities in <code className="bg-gray-100 px-2 py-1 rounded">lib/fheClient.ts</code></p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Encrypt Patient Data</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>{`import { encryptPatientData } from '@/lib/fheClient';

const encryptedData = await encryptPatientData({
  age: 45,
  gender: 1,  // 1=male, 2=female, 3=other
  bmiScore: 28.5,
  hasMedicalCondition: true,
  conditionCode: "E11"  // ICD-10 code
});

// Returns:
// {
//   age: { handle: "0x...", ... },
//   ageProof: "0x...",
//   gender: { handle: "0x...", ... },
//   genderProof: "0x...",
//   ...
// }`}</code></pre>
                </div>

                <div>
                  <h4 className="font-semibold">Encrypt Trial Criteria</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>{`import { encryptTrialCriteria } from '@/lib/fheClient';

const encryptedCriteria = await encryptTrialCriteria({
  trialName: "Diabetes Study 2025",
  description: "Testing new treatment",
  minAge: 18,
  maxAge: 65,
  requiredGender: 0,
  minBMIScore: 18.5,
  maxBMIScore: 35,
  hasSpecificCondition: true,
  conditionCode: "E11"
});`}</code></pre>
                </div>

                <div>
                  <h4 className="font-semibold">Decrypt Eligibility Result</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>{`import { decryptEligibilityResult } from '@/lib/fheClient';

const isEligible = await decryptEligibilityResult(
  encryptedResult,
  contractAddress,
  signer
);

console.log(isEligible); // true or false`}</code></pre>
                </div>
              </div>
            </div>

            <div id="web3-api" className="docs-card mb-6">
              <h3 className="text-xl font-bold mb-4">Web3 Client API</h3>
              <p className="mb-4">Blockchain interaction utilities in <code className="bg-gray-100 px-2 py-1 rounded">lib/web3Client.ts</code></p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Register Patient</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>{`import { registerPatient } from '@/lib/web3Client';

await registerPatient(signer, encryptedData, publicKeyHash);`}</code></pre>
                </div>

                <div>
                  <h4 className="font-semibold">Register Trial</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>{`import { registerTrial } from '@/lib/web3Client';

await registerTrial(
  signer,
  trialName,
  description,
  encryptedCriteria
);`}</code></pre>
                </div>

                <div>
                  <h4 className="font-semibold">Compute Eligibility</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>{`import { computeEligibility } from '@/lib/web3Client';

await computeEligibility(signer, trialId, patientAddress);`}</code></pre>
                </div>
              </div>
            </div>

            <div id="contract-api" className="docs-card">
              <h3 className="text-xl font-bold mb-4">Smart Contract API</h3>
              <p className="mb-4">Contract deployed at <code className="bg-gray-100 px-2 py-1 rounded">0xe790E247C5793AD4EDDE7C1cFd6582b45F603947</code> on Sepolia</p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">registerPatient</h4>
                  <p className="text-sm text-gray-600 mb-2">Register a patient with encrypted medical data</p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs"><code>{`function registerPatient(
    bytes32 ageHandle,
    bytes32 ageProof,
    bytes32 genderHandle,
    bytes32 genderProof,
    bytes32 bmiScoreHandle,
    bytes32 bmiProof,
    bytes32 hasMedicalConditionHandle,
    bytes32 conditionProof,
    bytes32 conditionCodeHandle,
    bytes32 codeProof,
    bytes32 publicKeyHash
) external`}</code></pre>
                </div>

                <div>
                  <h4 className="font-semibold">registerTrial</h4>
                  <p className="text-sm text-gray-600 mb-2">Create a new clinical trial (owner only)</p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs"><code>{`function registerTrial(
    string memory trialName,
    string memory description,
    bytes32 minAgeHandle,
    bytes32 minAgeProof,
    // ... (14 more encrypted parameters)
) external onlyOwner`}</code></pre>
                </div>

                <div>
                  <h4 className="font-semibold">computeEligibility</h4>
                  <p className="text-sm text-gray-600 mb-2">Compute eligibility on encrypted data</p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs"><code>{`function computeEligibility(
    uint256 _trialId,
    address _patientAddress
) external`}</code></pre>
                </div>

                <div>
                  <h4 className="font-semibold">getEligibilityResult</h4>
                  <p className="text-sm text-gray-600 mb-2">Get encrypted result (patient only)</p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs"><code>{`function getEligibilityResult(
    uint256 _trialId,
    address _patientAddress
) external view returns (bytes32)`}</code></pre>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="docs-section mb-16">
            <h2 className="docs-section-title">🐛 Troubleshooting</h2>

            <div className="space-y-6">
              <div className="docs-card">
                <h3 className="text-lg font-bold mb-3">Common Issues</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-red-700">"Cannot connect to wallet"</h4>
                    <p className="text-sm mb-2">Ensure MetaMask is installed and you're on Sepolia testnet</p>
                    <p className="text-sm"><strong>Solution:</strong> Refresh page, check MetaMask, verify network</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700">"Transaction failed"</h4>
                    <p className="text-sm mb-2">Not enough ETH for gas fees</p>
                    <p className="text-sm"><strong>Solution:</strong> Get free Sepolia ETH from <a href="https://sepoliafaucet.com" target="_blank" className="text-blue-600 underline">sepoliafaucet.com</a></p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700">"FHE initialization failed"</h4>
                    <p className="text-sm mb-2">Zama FHE SDK still loading</p>
                    <p className="text-sm"><strong>Solution:</strong> Wait 5-10 seconds, check internet connection, refresh page</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700">"Eligibility computation failed"</h4>
                    <p className="text-sm mb-2">Patient or trial not registered</p>
                    <p className="text-sm"><strong>Solution:</strong> Ensure you're registered and the trial exists</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700">"Cannot decrypt result"</h4>
                    <p className="text-sm mb-2">Only patients can decrypt their own results</p>
                    <p className="text-sm"><strong>Solution:</strong> Use the correct wallet address, sign EIP-712 message</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section id="security" className="docs-section mb-16">
            <h2 className="docs-section-title">🔒 Security & Privacy</h2>

            <div className="docs-card">
              <h3 className="text-xl font-bold mb-4">Privacy Guarantees</h3>
              <ul className="space-y-2">
                <li>✅ <strong>Zero Knowledge:</strong> Trial sponsors learn NOTHING about patient data</li>
                <li>✅ <strong>Encrypted Computation:</strong> All operations on encrypted data</li>
                <li>✅ <strong>Private Decryption:</strong> Only patients can decrypt their results</li>
                <li>✅ <strong>No Plaintext Storage:</strong> Only encrypted data on-chain</li>
                <li>✅ <strong>Pausable Contract:</strong> Emergency stop functionality</li>
              </ul>

              <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
                <p className="font-semibold text-green-800">Compliance:</p>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li><strong>HIPAA Compliant:</strong> No PHI disclosure without patient consent</li>
                  <li><strong>GDPR Compliant:</strong> Data protection by design and default</li>
                  <li><strong>Regulatory Friendly:</strong> Privacy-first architecture</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Deployment */}
          <section id="deployment" className="docs-section mb-16">
            <h2 className="docs-section-title">🚢 Deployment</h2>

            <div className="docs-card">
              <h3 className="text-xl font-bold mb-4">Current Deployment</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="mb-2"><strong>Network:</strong> Sepolia Testnet</p>
                <p className="mb-2"><strong>Contract:</strong> 0xe790E247C5793AD4EDDE7C1cFd6582b45F603947</p>
                <p className="mb-2"><strong>Chain ID:</strong> 11155111</p>
                <p><strong>View on Etherscan:</strong> <a href="https://sepolia.etherscan.io/address/0xe790E247C5793AD4EDDE7C1cFd6582b45F603947" target="_blank" className="text-blue-600 underline">sepolia.etherscan.io</a></p>
              </div>

              <h4 className="font-bold mb-2">Local Deployment</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>{`# Deploy to local network
npm run deploy:local

# Deploy to Sepolia
npm run deploy:sepolia

# Run tests
npm test

# Compile contracts
npx hardhat compile`}</code></pre>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-600">
              <p className="mb-2">Built with ❤️ using Zama FHEVM</p>
              <p>Privacy-Preserving Clinical Trial Matching</p>
              <div className="mt-4 flex justify-center space-x-4">
                <Link href="/" className="text-blue-600 hover:underline">Home</Link>
                <span>•</span>
                <Link href="/patient" className="text-blue-600 hover:underline">Patient</Link>
                <span>•</span>
                <Link href="/trial-admin" className="text-blue-600 hover:underline">Trial Admin</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
