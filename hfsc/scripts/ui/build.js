import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['./ui/index.ts'],  // Entry point of your TypeScript file
  bundle: true,                 // Bundle all dependencies
  outfile: './dist/ui/libs/based-client.js', // Output file
  format: 'esm',                // Output in ES module format
  platform: 'browser',          // Target for the browser

  minify: true,                 // Optional: Minify the output
}).catch(() => process.exit(1));