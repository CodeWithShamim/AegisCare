/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  parseBlockchainError,
  getErrorIcon,
  getErrorColors,
  type ErrorInfo,
} from '@/lib/errorHandler';

interface ErrorDisplayProps {
  error: any;
  onDismiss?: () => void;
  showTechnicalDetails?: boolean;
}

export default function ErrorDisplay({
  error,
  onDismiss,
  showTechnicalDetails = false,
}: ErrorDisplayProps) {
  const [showTechDetails, setShowTechDetails] = useState(false);

  if (!error) return null;

  const errorInfo: ErrorInfo = parseBlockchainError(error);
  const colors = getErrorColors(errorInfo.type);

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-6`}>
      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0 mr-4">
          <div dangerouslySetInnerHTML={{ __html: getErrorIcon(errorInfo.type) }} />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Title and Dismiss Button */}
          <div className="flex items-start justify-between">
            <h3 className={`text-lg font-semibold ${colors.title} mb-2`}>{errorInfo.title}</h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`text-${
                  errorInfo.type === 'warning' ? 'yellow' : 'red'
                }-400 hover:text-${
                  errorInfo.type === 'warning' ? 'yellow' : 'red'
                }-600 transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Main Message */}
          <p className={`text-sm ${colors.message} mb-3`}>{errorInfo.message}</p>

          {/* Suggestion */}
          {errorInfo.suggestion && (
            <div
              className={`mb-3 p-3 ${colors.bg} border-l-4 ${
                errorInfo.type === 'warning' ? 'border-yellow-400' : 'border-red-400'
              } rounded`}
            >
              <div className="flex items-start">
                <svg
                  className={`w-4 h-4 ${colors.icon} mr-2 mt-0.5 flex-shrink-0`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-gray-700">{errorInfo.suggestion}</p>
              </div>
            </div>
          )}

          {/* Technical Details Toggle */}
          {(showTechnicalDetails || errorInfo.technical) && (
            <details className="mt-3">
              <summary
                className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                onClick={() => setShowTechDetails(!showTechDetails)}
              >
                {showTechDetails ? 'Hide' : 'Show'} Technical Details
              </summary>
              {showTechDetails && errorInfo.technical && (
                <div className="mt-2 p-3 bg-gray-900 rounded-lg">
                  <code className="text-xs text-green-400 font-mono break-all">
                    {errorInfo.technical}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(errorInfo.technical || '');
                    }}
                    className="mt-2 text-xs text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy error details
                  </button>
                </div>
              )}
            </details>
          )}

          {/* Quick Actions for Common Errors */}
          {errorInfo.title === 'Already Registered' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => (window.location.href = '/patient')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check Eligibility
              </button>
            </div>
          )}

          {errorInfo.title === 'Patient Not Found' && (
            <div className="mt-4">
              <button
                onClick={() => {
                  window.location.href = '/patient';
                  setTimeout(() => {
                    // Switch to register tab
                    const registerTab = document.querySelector(
                      'button:has-text("Register")',
                    ) as HTMLButtonElement;
                    registerTab?.click();
                  }, 100);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register as Patient
              </button>
            </div>
          )}

          {errorInfo.title === 'Insufficient Funds' && (
            <div className="mt-4">
              <a
                href="https://sepoliafaucet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Get Free Sepolia ETH
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
