// Global test setup — runs before each test file
// Resets the content registry so modules don't bleed between test files
import '@testing-library/jest-dom';
import { contentRegistry } from "@/lib/content/content-registry";
import { afterEach, beforeEach } from "vitest";

beforeEach(() => {
  contentRegistry._resetForTesting();
});

afterEach(() => {
  contentRegistry._resetForTesting();
});
