const { build } = require('esbuild');
const { resolve } = require('path');

const baseConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  minify: false,
  keepNames: true,
  treeShaking: true,
  splitting: false,
  external: [],
  alias: {
    '@': resolve(__dirname, 'src'),
    '@/core': resolve(__dirname, 'src/core'),
    '@/interfaces': resolve(__dirname, 'src/interfaces'),
    '@/patterns': resolve(__dirname, 'src/patterns'),
    '@/validation': resolve(__dirname, 'src/validation'),
    '@/utils': resolve(__dirname, 'src/utils'),
    '@/statistics': resolve(__dirname, 'src/statistics'),
    '@/history': resolve(__dirname, 'src/history'),
    '@/observers': resolve(__dirname, 'src/observers'),
    '@/errors': resolve(__dirname, 'src/errors'),
    '@/logger': resolve(__dirname, 'src/logger'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  banner: {
    js: '#!/usr/bin/env node',
  },
};

async function buildAll() {
  const isProduction = process.env.NODE_ENV === 'production';

  const config = {
    ...baseConfig,
    minify: isProduction,
    sourcemap: !isProduction,
  };

  try {
    console.log(
      `🚀 Building ${isProduction ? 'production' : 'development'} bundle...`
    );

    // Build CommonJS version
    await build({
      ...config,
      format: 'cjs',
      outfile: 'dist/index.js',
    });

    // Build ESM version
    await build({
      ...config,
      format: 'esm',
      outfile: 'dist/index.mjs',
    });

    // Performance modules are built by TypeScript compiler in build:types step

    console.log('✅ Build completed successfully');

    if (isProduction) {
      console.log('📦 Production build optimized and minified');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildAll();
}

module.exports = { baseConfig, buildAll };
