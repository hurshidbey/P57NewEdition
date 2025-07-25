// This hook now acts as a simple wrapper around the ProgressContext
// to maintain backward compatibility
import { useProgressContext } from '@/contexts/progress-context';

export type { ProgressData, ProtocolProgress } from '@/contexts/progress-context';

export function useProgress() {
  return useProgressContext();
}