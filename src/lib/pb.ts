import PocketBase from 'pocketbase';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

// If the URL is explicitly set to 127.0.0.1 or localhost, and we're in a browser,
// we should use the current hostname to avoid "Local Network Access" security blocks
// in browsers like Microsoft Edge when the app is accessed via a real IP/domain.
const finalPbUrl = (pbUrl.includes('127.0.0.1') || pbUrl.includes('localhost')) && typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
  ? pbUrl.replace(/127\.0\.0\.1|localhost/, window.location.hostname)
  : pbUrl;

export const pb = new PocketBase(finalPbUrl);
