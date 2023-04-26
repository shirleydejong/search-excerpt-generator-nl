import * as esbuild from 'esbuild'

esbuild.build({
	entryPoints: ['./src/index.js'],
	bundle: true,
	outfile: './dist/index.js',
	format: 'esm',
	minify: true,
	target: 'esnext',
	keepNames: true,
	allowOverwrite: true,
	logLevel: 'info',
	charset: 'utf8',
});

esbuild.build({
	entryPoints: ['./src/index.js'],
	bundle: true,
	outfile: './dist/index.cjs',
	format: 'cjs',
	minify: true,
	target: 'esnext',
	keepNames: true,
	allowOverwrite: true,
	logLevel: 'info',
	charset: 'utf8',
});