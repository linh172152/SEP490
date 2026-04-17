import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Hook to check if the component is mounted on the client.
 * This is the React 18+ way to handle hydration mismatches without
 * triggering the 'setState in useEffect' performance warning.
 */
export function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
