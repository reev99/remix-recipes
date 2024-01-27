import { useLocation, useMatches } from '@remix-run/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export function classNames(...names: Array<string | undefined>) {
  const className = names.reduce(
    (acc, name) => (name ? `${acc} ${name}` : acc),
    '',
  );

  return className || '';
}

export function useMatchesData(id: string) {
  const matches = useMatches();
  const route = useMemo(
    () => matches.find((route) => route.id === id),
    [matches, id],
  );

  return route?.data;
}

export function isRunningOnServer() {
  return typeof window === 'undefined';
}

export const useServerLayoutEffect = isRunningOnServer()
  ? useEffect
  : useLayoutEffect;

let hasHydrated = false;
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(hasHydrated);

  useEffect(() => {
    hasHydrated = true;
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Returns a debounced version of the passed function that delays invoking the
 * function until after `time` milliseconds have elapsed since the last time it
 * was invoked.
 *
 * This is useful to limit how often an expensive function can be executed.
 */
export function useDebouncedFunction<T extends Array<any>>(
  fn: (...args: T) => unknown,
  time: number,
) {
  const timeoutId = useRef<number>();

  // create and return debounced fn
  const debouncedFn = (...args: T) => {
    window.clearTimeout(timeoutId.current);
    timeoutId.current = window.setTimeout(() => fn(...args), time);
  };

  return debouncedFn;
}

/**
 * Returns a function that builds a search parameter string for the current location.
 * Takes a parameter name and value, sets them in the URLSearchParams for the
 * current location, and returns a search string that can be appended to the URL.
 */
export function useBuildSearchParams() {
  const location = useLocation();

  return (name: string, value: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set(name, value);

    return `?${searchParams.toString()}`;
  };
}
