import { InitialOptionsTsJest } from 'ts-jest/dist/types';

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  forceExit: true,
  testPathIgnorePatterns: ['dist'],
  coveragePathIgnorePatterns: ['src/wrappers/'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  reporters: ['<rootDir>/jest-reporters/emit-only-failures.js'],
};

export default config;
