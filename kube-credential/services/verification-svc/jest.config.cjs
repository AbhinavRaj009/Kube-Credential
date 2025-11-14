export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  roots: ["<rootDir>/tests"],
  globals: { "ts-jest": { useESM: true, tsconfig: "<rootDir>/tsconfig.json" } }
};
