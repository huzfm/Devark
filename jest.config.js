export default {
    testEnvironment: 'node',
    testMatch: [
        '<rootDir>/tests/**/*.test.js'
    ],
    collectCoverageFrom: [
        'bin/**/*.js',
        'utils/**/*.js',
        'packages/**/*.js',
        '!**/node_modules/**',
        '!**/templates/**'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    transform: {},
    testTimeout: 10000
};