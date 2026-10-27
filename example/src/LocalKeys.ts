/**
 * Your own sandbox keys, kept out of the repo. Debug builds read keys.local.json at the repo root
 * (it is gitignored), and Settings > Saved Keys switches between them. See keys.local.example.json
 * for the format.
 */

export interface LocalKey {
  name: string;
  publicKey: string;
  merchantId?: string;
}

function readKeys(): LocalKey[] {
  if (!__DEV__) return [];
  try {
    // An optional dependency: Metro bundles the file when it exists and this throws when it does not.
    const keys = require('../../keys.local.json');
    return Array.isArray(keys) ? keys : [];
  } catch {
    return [];
  }
}

export const LocalKeys: { all: LocalKey[] } = { all: readKeys() };
