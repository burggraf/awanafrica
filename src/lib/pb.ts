import PocketBase from 'pocketbase';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || window.location.origin;

export const pb = new PocketBase(pbUrl);
