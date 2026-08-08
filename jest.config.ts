import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@clerk/(.*)$": "<rootDir>/__mocks__/@clerk/$1",
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.test.tsx"],
  collectCoverageFrom: [
    "src/lib/permissions.ts",
    "src/lib/utils.ts",
    "src/lib/errors.ts",
    "src/lib/EventBus.ts",
    "src/services/**/*.ts",
    "src/repositories/**/*.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
};

export default createJestConfig(config);
