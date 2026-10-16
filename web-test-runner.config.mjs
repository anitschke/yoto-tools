import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  browsers: [
    playwrightLauncher({
      product: 'chromium',
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    }),
  ],
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'es2022',
      tsconfig: 'tsconfig.json',
    }),
  ],
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '10000',
    },
  },
};
