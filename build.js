const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: {
    'main': './src/scripts/main.ts',
    'week4': './src/scripts/week4.ts'
  },
  bundle: true,
  outdir: './dist',
  format: 'esm',
  splitting: true,
  sourcemap: true,
  minify: !isWatch,
  target: ['es2020'],
};

async function build() {
  if (isWatch) {
    const context = await esbuild.context(buildOptions);
    await context.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('Build complete!');
  }
}

build().catch(() => process.exit(1));
