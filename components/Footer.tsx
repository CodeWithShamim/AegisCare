import Link from 'next/link';
import Logo from './Logo';
import {
  ADVISOR_ADDRESS,
  GENLAYER_EXPLORER_URL,
  genlayerExplorerAddressUrl,
} from '@/config/genLayerContracts';

const FHE_CONTRACT = '0x3DB49a1Ca0d72740e54f5FB06Ccc69576c4192F7';

const productLinks = [
  { href: '/patient', label: 'Patient Portal' },
  { href: '/trial-admin', label: 'Trial Admin' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/docs', label: 'Documentation' },
];

const explorerLinks = [
  {
    href: `https://sepolia.etherscan.io/address/${FHE_CONTRACT}`,
    label: 'FHE Contract · Etherscan',
  },
  {
    href: ADVISOR_ADDRESS
      ? genlayerExplorerAddressUrl(ADVISOR_ADDRESS)
      : GENLAYER_EXPLORER_URL,
    label: 'AI Advisor · GenLayer Explorer',
  },
  { href: 'https://docs.zama.ai/', label: 'Zama FHEVM Docs' },
  { href: 'https://docs.genlayer.com/', label: 'GenLayer Docs' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-gray-200 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={36} />
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Aegis<span className="ac-gradient-text">Care</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
              Privacy-preserving clinical trial matching. FHE-encrypted eligibility on
              Sepolia, enriched by a GenLayer AI advisor — your medical data never leaves
              the browser in plaintext.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Zama fhEVM
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                GenLayer StudioNet
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 transition-colors hover:text-indigo-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explorers & Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Explorers &amp; Docs
            </h3>
            <ul className="mt-4 space-y-2.5">
              {explorerLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-indigo-600"
                  >
                    {l.label}
                    <svg
                      className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7M7 7h10v10" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AegisCare · Privacy-Preserving Clinical Trial
            Matching
          </p>
          <p className="text-xs text-gray-400">
            Powered by Zama FHEVM &amp; GenLayer AI consensus
          </p>
        </div>
      </div>
    </footer>
  );
}
