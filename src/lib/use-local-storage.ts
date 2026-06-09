import { useCallback, useRef, useState } from "react";
import type { ZodType } from "zod";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  schema?: ZodType<T>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item);
      if (schema) {
        const result = schema.safeParse(parsed);
        return result.success ? result.data : initialValue;
      }
      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = useCallback(
    (value: React.SetStateAction<T>) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValueRef.current) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Error writing localStorage:", error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}
