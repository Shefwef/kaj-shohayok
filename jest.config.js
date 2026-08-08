const nextJest = require("next/jest.js");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@clerk/(.*)$": "<rootDir>/__mocks__/@clerk/$1",
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.test.tsx"],
  collectCoverageFrom: [
    "src/lib/utils.ts",
    "src/lib/errors.ts",
    "src/lib/EventBus.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 65,
    },
  },
};

module.exports = createJestConfig(config);
