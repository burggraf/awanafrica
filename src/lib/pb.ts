import PocketBase from 'pocketbase';

const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const pbUrl = isHttps ? 'https://awanafrica.org' : (import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

export const pb = new PocketBase(pbUrl);
