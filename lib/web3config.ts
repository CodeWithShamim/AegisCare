import { http, createConfig, createStorage } from "wagmi";
import { hardhat, mainnet, sepolia } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi/react";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export const metadata = {
  name: "AegisCare",
  description: "Privacy-Preserving Clinical Trial Matching using FHE",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://localhost:3000",
  icons: ["/favicon.ico"],
};

// Create noop storage for SSR
function createNoopStorage() {
  return {
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, _value: string) => Promise.resolve(),
    removeItem: (_key: string) => Promise.resolve(),
  };
}

// Create storage that works with SSR
const storage = createStorage({
  storage: typeof window !== "undefined"
    ? window.localStorage
    : createNoopStorage() as any,
});

// Wagmi configuration
export const config = createConfig({
  chains: [hardhat, mainnet, sepolia],
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http("https://rpc.ankr.com/eth_sepolia"),
  },
  ssr: false, // Disable SSR to avoid indexedDB issues
  storage,
});

// Create Web3Modal (client-side only)
if (typeof window !== "undefined") {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false,
    enableOnramp: false,
  });
}

// Export chains for use in components
export { hardhat, mainnet, sepolia };
