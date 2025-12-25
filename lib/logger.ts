/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Debug Logger Utility
 * @module lib/logger
 *
 * Provides conditional logging based on DEBUG environment variable
 * Logs are only emitted in development mode
 */

const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDebug && typeof window !== 'undefined') {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },

  warn: (...args: any[]) => {
    if (isDebug && typeof window !== 'undefined') {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDebug && typeof window !== 'undefined') {
      console.info(...args);
    }
  }
};
