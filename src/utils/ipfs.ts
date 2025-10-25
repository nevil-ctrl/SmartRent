import { create as createIpfsClient } from 'ipfs-http-client';
import type { IPFSHTTPClient } from 'ipfs-http-client';

// Simple IPFS helper using ipfs-http-client
// Configure via environment variables (Vite) or hardcode an Infura/Pinata endpoint

const VITE_ENV: any = (import.meta as any).env || {};
const INFURA_PROJECT_ID = VITE_ENV.VITE_IPFS_PROJECT_ID || '';
const INFURA_PROJECT_SECRET = VITE_ENV.VITE_IPFS_PROJECT_SECRET || '';
const INFURA_ENDPOINT = VITE_ENV.VITE_IPFS_ENDPOINT || 'https://ipfs.infura.io:5001';

let client: IPFSHTTPClient | null = null;

export function getIpfsClient(): IPFSHTTPClient {
  if (client) return client;

  // If project id/secret provided, use basic auth for Infura (browser-safe)
  if (INFURA_PROJECT_ID && INFURA_PROJECT_SECRET) {
    const auth = 'Basic ' + btoa(`${INFURA_PROJECT_ID}:${INFURA_PROJECT_SECRET}`);
    client = createIpfsClient({
      url: INFURA_ENDPOINT,
      headers: {
        authorization: auth,
      },
    }) as unknown as IPFSHTTPClient;
  } else {
    client = createIpfsClient({ url: 'https://ipfs.infura.io:5001' }) as unknown as IPFSHTTPClient;
  }

  return client;
}

export async function uploadFile(file: File): Promise<string> {
  const ipfs = getIpfsClient();
  const result = await ipfs.add(file as any);
  return (result as any).path || (result as any).cid.toString();
}

export async function uploadJSON(obj: any): Promise<string> {
  const ipfs = getIpfsClient();
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const result = await ipfs.add(data);
  return (result as any).path || (result as any).cid.toString();
}
