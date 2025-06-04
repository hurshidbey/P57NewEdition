import Fuse from 'fuse.js';
import { Protocol } from '@shared/schema';

export function createFuseSearch(protocols: Protocol[]) {
  if (!protocols || protocols.length === 0) return null;

  const options = {
    keys: [
      {
        name: 'title',
        weight: 0.7,
      },
      {
        name: 'description',
        weight: 0.3,
      },
    ],
    threshold: 0.3, // Lower threshold = more strict matching
    includeScore: true,
    minMatchCharLength: 2,
  };

  return new Fuse(protocols, options);
}
