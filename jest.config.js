module.exports = {
    preset: 'ts-jest',
    transform: {
      '^.+\\.(ts|js)?$': 'ts-jest',
    },
    rootDir: './',
    coverageReporters: ['json', 'lcov', 'text-summary'],
    collectCoverageFrom: ['src/**/*.js', 'src/**/*.ts'],
    roots: ['src', 'test'],
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
    ],
    testEnvironment : 'jsdom'
  };
  