export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  extensionsToTreatAsEsm: [".js"],
  collectCoverage: false,
  coverageReporters: ["text", "lcov"],
};
