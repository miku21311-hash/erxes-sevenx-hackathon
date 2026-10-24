/* eslint-disable */
// Default export required by Jest - do not remove
export default {
  displayName: 'sevenx-ui',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/plugins/sevenx_ui',
};
