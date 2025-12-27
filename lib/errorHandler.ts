/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ErrorInfo {
  title: string;
  message: string;
  suggestion?: string;
  type: "warning" | "error" | "critical";
  technical?: string;
}

/**
 * Parse blockchain error and return user-friendly information
 */
export function parseBlockchainError(error: any): ErrorInfo {
  const errorMessage = error?.message || error?.toString() || "Unknown error";

  console.log("[ErrorParser] Raw error:", errorMessage);

  // 1. User rejected transaction
  if (
    errorMessage.includes("User rejected") ||
    errorMessage.includes("user rejected")
  ) {
    return {
      title: "Transaction Cancelled",
      message: "You cancelled the transaction in your wallet.",
      suggestion:
        "If you did this intentionally, you can ignore this message. Otherwise, please try again.",
      type: "warning",
    };
  }

  // 2. Insufficient funds
  if (
    errorMessage.includes("insufficient funds") ||
    errorMessage.includes("exceeds balance")
  ) {
    return {
      title: "Insufficient Funds",
      message:
        "Your wallet doesn't have enough ETH to pay for the transaction.",
      suggestion:
        "Please add more ETH to your wallet and try again. You only need a small amount for gas fees.",
      type: "error",
      technical: "Insufficient balance for transaction gas",
    };
  }

  // 3. Network error
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("Network error")
  ) {
    return {
      title: "Network Connection Error",
      message: "Unable to connect to the blockchain network.",
      suggestion:
        "Please check your internet connection and make sure your wallet is connected to Sepolia testnet.",
      type: "error",
      technical: "Network connection failed",
    };
  }

  // 4. Patient already registered
  if (
    errorMessage.includes("0x4fe47f77") ||
    errorMessage.includes("InvalidEncryptedInput")
  ) {
    return {
      title: "Already Registered",
      message: "This wallet address has already registered as a patient.",
      suggestion:
        "You can proceed to check your eligibility for clinical trials. If you want to update your information, please use a different wallet address.",
      type: "warning",
      technical: "Contract rejection: Patient already exists",
    };
  }

  // 5. Patient not found
  if (
    errorMessage.includes("PatientNotFound") ||
    errorMessage.includes("patient not found")
  ) {
    return {
      title: "Patient Not Found",
      message: "No registration found for this wallet address.",
      suggestion:
        "Please register as a patient first before checking eligibility.",
      type: "warning",
      technical: "Patient does not exist",
    };
  }

  // 6. Trial not found
  if (
    errorMessage.includes("TrialNotFound") ||
    errorMessage.includes("trial not found")
  ) {
    return {
      title: "Trial Not Found",
      message: "The selected clinical trial doesn't exist or has been removed.",
      suggestion:
        "Please select a different trial or contact support if this seems incorrect.",
      type: "error",
      technical: "Trial does not exist",
    };
  }

  // 7. Unauthorized
  if (
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("NotAuthorized")
  ) {
    return {
      title: "Unauthorized Action",
      message: "You don't have permission to perform this action.",
      suggestion:
        "Please make sure you're connected with the correct wallet address.",
      type: "error",
      technical: "Authorization failed",
    };
  }

  // 8. Gas estimation failed
  if (
    errorMessage.includes("gas required exceeds allowance") ||
    errorMessage.includes("estimateGas")
  ) {
    return {
      title: "Transaction Error",
      message: "Unable to process the transaction.",
      suggestion:
        "This could be due to invalid data or a contract error. Please check your inputs and try again. If the problem persists, the contract may need to be updated.",
      type: "error",
      technical: "Gas estimation failed - transaction would revert",
    };
  }

  // 9. FHE/Encryption errors
  if (
    errorMessage.includes("FHE") ||
    errorMessage.includes("encryption") ||
    errorMessage.includes("decrypt")
  ) {
    return {
      title: "Encryption Error",
      message: "There was a problem processing your encrypted data.",
      suggestion:
        "Please try again. If the problem persists, make sure you're using the latest version of the browser and have JavaScript enabled.",
      type: "error",
      technical: "FHE operation failed",
    };
  }

  // 10. Contract paused
  if (
    errorMessage.includes("paused") ||
    errorMessage.includes("ContractPaused")
  ) {
    return {
      title: "System Temporarily Unavailable",
      message: "The AegisCare system is currently paused for maintenance.",
      suggestion:
        "Please try again later. You can check our announcements for updates.",
      type: "warning",
      technical: "Contract is paused",
    };
  }

  // 11. Wallet not connected
  if (errorMessage.includes("wallet") && errorMessage.includes("not")) {
    return {
      title: "Wallet Not Connected",
      message: "Please connect your wallet to continue.",
      suggestion:
        'Click the "Connect Wallet" button in the top right corner of the page.',
      type: "warning",
      technical: "No wallet connection detected",
    };
  }

  // 12. Timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
    return {
      title: "Request Timeout",
      message: "The transaction took too long to process.",
      suggestion:
        "Please try again. The network might be congested. Consider increasing gas settings in your wallet if this happens frequently.",
      type: "error",
      technical: "Transaction timeout",
    };
  }

  // 13. Default generic error
  return {
    title: "Transaction Failed",
    message: "An unexpected error occurred while processing your request.",
    suggestion:
      "Please try again. If the problem persists, please contact support with the error details below.",
    type: "error",
    technical:
      errorMessage.substring(0, 200) + (errorMessage.length > 200 ? "..." : ""),
  };
}

/**
 * Get error icon SVG based on error type
 */
export function getErrorIcon(type: "warning" | "error" | "critical"): string {
  switch (type) {
    case "warning":
      return `<svg class="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>`;
    case "error":
      return `<svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`;
    case "critical":
      return `<svg class="w-12 h-12 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`;
  }
}

/**
 * Get error colors based on type
 */
export function getErrorColors(type: "warning" | "error" | "critical") {
  switch (type) {
    case "warning":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        title: "text-yellow-900",
        message: "text-yellow-800",
        icon: "text-yellow-600",
      };
    case "error":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        title: "text-red-900",
        message: "text-red-800",
        icon: "text-red-600",
      };
    case "critical":
      return {
        bg: "bg-red-100",
        border: "border-red-300",
        title: "text-red-900",
        message: "text-red-800",
        icon: "text-red-700",
      };
  }
}
