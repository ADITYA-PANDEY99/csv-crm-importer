"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to debounce updates to a fast-changing state.
 *
 * @param value - The value to debounce.
 * @param delay - Delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
