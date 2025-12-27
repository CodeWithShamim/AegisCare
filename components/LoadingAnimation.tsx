'use client';

interface LoadingAnimationProps {
  message: string;
  submessage?: string;
  type?: 'encryption' | 'transaction' | 'blockchain' | 'default';
}

export default function LoadingAnimation({
  message,
  submessage,
  type = 'default',
}: LoadingAnimationProps) {
  const getIcon = () => {
    switch (type) {
      case 'encryption':
        return (
          <div className="relative">
            <div className="animate-pulse absolute inset-0 bg-blue-400 rounded-full opacity-20 blur-xl"></div>
            <svg
              className="w-16 h-16 text-blue-600 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        );
      case 'transaction':
        return (
          <div className="relative">
            <div className="animate-pulse absolute inset-0 bg-green-400 rounded-full opacity-20 blur-xl"></div>
            <svg
              className="w-16 h-16 text-green-600 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        );
      case 'blockchain':
        return (
          <div className="relative">
            <div className="animate-pulse absolute inset-0 bg-purple-400 rounded-full opacity-20 blur-xl"></div>
            <svg
              className="w-16 h-16 text-purple-600 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        );
    }
  };

  const getDots = () => {
    const dots = ['.', '..', '...'];
    const [dotIndex, setDotIndex] = React.useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setDotIndex((prev) => (prev + 1) % 3);
      }, 500);
      return () => clearInterval(interval);
    }, []);

    return dots[dotIndex];
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {getIcon()}

      {/* Main message with animated dots */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {message}
          <span className="inline-block w-8">{getDots()}</span>
        </h3>
        {submessage && <p className="text-sm text-gray-600 mt-2">{submessage}</p>}
      </div>

      {/* Progress bar animation */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-progress"></div>
        </div>
      </div>

      {/* Info tips */}
      <div className="max-w-sm">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800 flex items-start">
            <svg
              className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {type === 'encryption' &&
                'Your data is being encrypted with military-grade FHE encryption. This happens locally in your browser.'}
              {type === 'transaction' &&
                'Please confirm the transaction in your wallet. This may take a few seconds.'}
              {type === 'blockchain' &&
                'Your transaction is being confirmed on the blockchain. This typically takes 15-30 seconds.'}
              {type === 'default' && 'Please wait while we process your request...'}
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

import React from 'react';
