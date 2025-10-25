import { create as createIpfsClient, IPFSHTTPClient } from 'ipfs-http-client';

// Simple IPFS helper using ipfs-http-client
// Configure via environment variables or hardcode an Infura/Pinata endpoint

const INFURA_PROJECT_ID = process.env.VITE_IPFS_PROJECT_ID || '';
const INFURA_PROJECT_SECRET = process.env.VITE_IPFS_PROJECT_SECRET || '';
const INFURA_ENDPOINT = process.env.VITE_IPFS_ENDPOINT || 'https://ipfs.infura.io:5001';

let client: IPFSHTTPClient | null = null;

export function getIpfsClient(): IPFSHTTPClient {
  if (client) return client;

  // If project id/secret provided, use basic auth for Infura
  if (INFURA_PROJECT_ID && INFURA_PROJECT_SECRET) {
    const auth = 'Basic ' + Buffer.from(INFURA_PROJECT_ID + ':' + INFURA_PROJECT_SECRET).toString('base64');
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
  return result.path || result.cid.toString();
}

export async function uploadJSON(obj: any): Promise<string> {
  const ipfs = getIpfsClient();
  const buffer = Buffer.from(JSON.stringify(obj));
  const result = await ipfs.add(buffer);
  return result.path || result.cid.toString();
}
