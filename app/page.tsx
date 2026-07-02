'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SplashScreen from '@/components/SplashScreen';
import MaskedCard from '@/components/MaskedCard';
import { useSparkleBurst } from '@/components/useSparkleBurst';
import { usePlatformStats } from '@/lib/hooks/usePlatformStats';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useImageWidth } from '@/hooks/useImageWidth';
import { useMaskPositions } from '@/hooks/useMaskPositions';
import { useStaggeredReveal } from '@/hooks/useStaggeredReveal';

/**
 * Shared hero background. A single large image is windowed across three feature
 * bars + one hero card via `useMaskPositions`. Swap this one string for a local
 * `/hero.jpg` later if desired.
 */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=2000&q=80';

const FEATURES = [
  'Zero-Knowledge Matching',
  'FHE-Encrypted Data',
  'HIPAA & GDPR Compliant',
];

/** Capability cards — restyled from the original feature grid. */
const CAPABILITIES = [
  {
    title: 'GenLayer AI Advisor',
    body: 'An AegisCareAdvisor Intelligent Contract explains eligibility, recommends trials, and validates registrations against live ICD-10 data — all through LLM-backed consensus.',
  },
  {
    title: 'Optimistic Democracy',
    body: 'Every advisor result is proposed by a leader and verified by independent validators with equivalence rules, so non-deterministic LLM output settles on-chain trustlessly.',
  },
  {
    title: 'End-to-End Encryption',
    body: 'Medical data is encrypted before leaving your browser and stays encrypted throughout the entire matching process.',
  },
  {
    title: 'FHE-Powered Matching',
    body: 'Eligibility is computed on encrypted data using Zama FHEVM — no plaintext exposure at any point.',
  },
  {
    title: 'Strict Privacy Boundary',
    body: 'The advisor only ever sees anonymized inputs — age buckets, condition categories, and PII-screened summaries. Raw or encrypted PHI never leaves the FHE layer.',
  },
  {
    title: 'Private Results',
    body: 'Only you can decrypt your eligibility results, using an EIP-712 signature from your own private key.',
  },
];

const PATIENT_STEPS = [
  'Register with encrypted medical data (age, gender, BMI, conditions)',
  'Browse available clinical trials',
  'Check eligibility — computed on encrypted data on-chain',
  'Decrypt your result with an EIP-712 signature (only you see it)',
];

const SPONSOR_STEPS = [
  'Create a trial with encrypted eligibility criteria',
  'Set age range, gender requirements, BMI limits, condition codes',
  'Patients check eligibility without revealing their data',
  'Privacy guaranteed — you never see patient medical data',
];

export default function Home() {
  const sparkle = useSparkleBurst();
  const stats = usePlatformStats();
  const isMobile = useIsMobile();
  const [gridRef, gridWidth] = useImageWidth<HTMLDivElement>();
  const { bars, hero } = useMaskPositions(gridWidth, isMobile, FEATURES.length);
  const revealRef = useStaggeredReveal<HTMLDivElement>({ stagger: 110 });
  const statsRef = useStaggeredReveal<HTMLDivElement>({ stagger: 90 });
  const capsRef = useStaggeredReveal<HTMLDivElement>({ stagger: 70 });
  const worksRef = useStaggeredReveal<HTMLDivElement>({ stagger: 120 });
  const archRef = useStaggeredReveal<HTMLDivElement>({ stagger: 120 });

  return (
    <div className="relative min-h-screen bg-white text-black">
      <SplashScreen />
      <Header />

      {/* Hero — full-height masked-card grid */}
      <main className="px-4 pt-20 md:px-6 md:pt-24">
        <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col justify-center py-6">
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-3 md:grid-cols-[38%_1fr] md:gap-4"
          >
            {/* Feature bars column */}
            <div ref={revealRef} className="flex flex-col gap-3 md:gap-4">
              {FEATURES.map((label, i) => (
                <MaskedCard
                  key={label}
                  image={HERO_IMAGE}
                  mask={bars[i]}
                  overlay={0.4}
                  className="h-24 md:h-auto md:flex-1"
                >
                  <div className="flex h-full items-end p-4">
                    <span className="text-lg font-bold leading-tight text-white md:text-xl">
                      {label}
                    </span>
                  </div>
                </MaskedCard>
              ))}
            </div>

            {/* Large hero card */}
            <MaskedCard
              image={HERO_IMAGE}
              mask={hero}
              overlay={0.45}
              className="min-h-104 md:min-h-152"
            >
              <div className="flex h-full flex-col justify-between p-6 md:p-10">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  Privacy-First Clinical Trials
                </span>

                <div>
                  <h1 className="ac-hero-headline max-w-3xl text-white">
                    Trial matching, without exposing your medical data
                  </h1>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/patient"
                      onClick={sparkle}
                      className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-black transition-transform hover:scale-105"
                    >
                      Check Eligibility
                    </Link>
                    <Link
                      href="/trial-admin"
                      className="inline-flex items-center justify-center rounded-full border border-white/70 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-white hover:text-black"
                    >
                      I&apos;m a Trial Sponsor
                    </Link>
                  </div>
                </div>
              </div>
            </MaskedCard>
          </div>
        </section>

        {/* Platform stats */}
        <section className="mx-auto max-w-7xl py-16 md:py-24">
          <div ref={statsRef} className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            <div className="rounded-2xl border border-black bg-white p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Active Trials
              </p>
              {stats.isLoading ? (
                <div className="mt-3 h-12 w-24 animate-pulse rounded bg-neutral-200" />
              ) : (
                <p className="mt-3 text-6xl font-extrabold tabular-nums leading-none">
                  {stats.totalTrials}
                </p>
              )}
              <p className="mt-2 text-sm text-neutral-500">Registered clinical trials</p>
            </div>

            <div className="rounded-2xl border border-black bg-black p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Protected Patients
              </p>
              {stats.isLoading ? (
                <div className="mt-3 h-12 w-24 animate-pulse rounded bg-white/20" />
              ) : (
                <p className="mt-3 text-6xl font-extrabold tabular-nums leading-none">
                  {stats.totalPatients}
                </p>
              )}
              <p className="mt-2 text-sm text-white/60">Privacy-preserving registrations</p>
            </div>

            <div className="rounded-2xl border border-black bg-white p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Data Privacy
              </p>
              <p className="mt-3 text-6xl font-extrabold tabular-nums leading-none">100%</p>
              <p className="mt-2 text-sm text-neutral-500">End-to-end encrypted</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-neutral-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-black" />
            </span>
            <span>Active on Zama FHE Devnet &amp; GenLayer StudioNet</span>
          </div>
        </section>

        {/* Capabilities */}
        <section className="mx-auto max-w-7xl py-16 md:py-24">
          <h2 className="ac-section-title mb-10 max-w-4xl">
            One platform, two layers of privacy
          </h2>
          <div ref={capsRef} className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="group rounded-2xl border border-black p-8 transition-colors hover:bg-black hover:text-white"
              >
                <h3 className="text-xl font-bold">{cap.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 group-hover:text-white/80">
                  {cap.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl py-16 md:py-24">
          <h2 className="ac-section-title mb-10">How it works</h2>
          <div ref={worksRef} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {[
              { title: 'For Patients', steps: PATIENT_STEPS },
              { title: 'For Trial Sponsors', steps: SPONSOR_STEPS },
            ].map((col) => (
              <div key={col.title} className="rounded-2xl border border-black p-8">
                <h3 className="text-xl font-bold">{col.title}</h3>
                <ol className="mt-6 space-y-4">
                  {col.steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-neutral-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Dual-chain architecture */}
        <section className="mx-auto max-w-7xl py-16 md:py-24">
          <h2 className="ac-section-title mb-4 max-w-4xl">A dual-chain architecture</h2>
          <p className="mb-10 max-w-3xl text-lg text-neutral-600">
            FHE handles the confidential math; GenLayer handles the judgment. Each layer does
            the one thing the other fundamentally cannot.
          </p>
          <div ref={archRef} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <div className="rounded-2xl border border-black p-8">
              <h3 className="text-xl font-bold">FHE Matching Layer</h3>
              <p className="mt-1 text-sm font-medium text-neutral-500">
                Zama fhEVM · Solidity · Sepolia
              </p>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                Computes eligibility entirely on encrypted data. Medical values and trial
                criteria never appear in plaintext on-chain.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li>▸ Encrypted patient registration &amp; trial criteria</li>
                <li>▸ FHE comparisons on encrypted euint values</li>
                <li>▸ EIP-712 private decryption by the patient only</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-black bg-black p-8 text-white">
              <h3 className="text-xl font-bold">AI Advisor Layer</h3>
              <p className="mt-1 text-sm font-medium text-white/60">
                GenLayer · Python · StudioNet
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                Runs LLM-backed logic with leader/validator consensus on anonymized inputs
                only. Explains, recommends, validates, and checks eligibility.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>▸ generate_explanation — plain-language result</li>
                <li>▸ recommend_trials — best 1–3 matches</li>
                <li>▸ validate_trial — checks live ICD-10 reference</li>
                <li>▸ check_eligibility — PII-screened summary</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Demo video */}
        <section className="mx-auto max-w-7xl py-16 md:py-24">
          <h2 className="ac-section-title mb-10">See AegisCare in action</h2>
          <div className="overflow-hidden rounded-2xl border border-black">
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/EvdMsxFs08c?rel=0&modestbranding=1"
                title="AegisCare Demo — Privacy-Preserving Clinical Trial Matching"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* User guide CTA */}
        <section className="mx-auto max-w-7xl pb-24 pt-16 md:pt-24">
          <div className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-black p-8 text-white md:flex-row md:items-center md:p-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Master AegisCare
              </h2>
              <p className="mt-3 text-white/70">
                Everything you need to know about privacy-preserving clinical trial matching —
                10 sections, 50+ FAQ answers, step-by-step tutorials.
              </p>
            </div>
            <Link
              href="https://github.com/CodeWithShamim/AegisCare/blob/main/USER_GUIDE.md"
              onClick={sparkle}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-black transition-transform hover:scale-105"
            >
              Read the User Guide
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
