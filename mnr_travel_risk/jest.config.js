const nextJest = require('next/jest')
 
/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
   setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], 

  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
 

  },
  transform: {'^.+\\.ts?$': 'ts-jest'},
"transformIgnorePatterns": ["node_modules/(?!nanostores/index.js)/"]

}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config)