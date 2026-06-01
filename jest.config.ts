import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],

  // Map @ alias
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Only run files in __tests__ or *.test.ts(x)
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{ts,tsx}",
  ],

  // Exclude E2E tests (those live in /e2e/ and run via Playwright)
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/.next/"],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/types/**",
    "!src/app/**/page.tsx",   // pages are integration tested via Playwright
    "!src/app/**/layout.tsx",
  ],
};

export default createJestConfig(config);
