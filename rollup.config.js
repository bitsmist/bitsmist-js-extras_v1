import nodeResolve from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";

export default [
	{
		input: 'src/extras/index.js',
		output: [
			{
				file: 'dist/bitsmist-js-extras_v1.min.js',
				name: 'BITSMIST.V1.$EXTRAS',
				format: 'umd',
				sourcemap: false,
				globals: {
					"@bitsmist-js_v1/core": "BITSMIST.V1.$CORE"
				},
				plugins: [
					terser({
						format: {comments:false},
						compress: {drop_console:true},
						keep_classnames: true,
					})
				],
			},
			{
				file: 'dist/bitsmist-js-extras_v1.js',
				name: 'BITSMIST.V1.$EXTRAS',
				format: 'umd',
				sourcemap: true,
				globals: {
					"@bitsmist-js_v1/core": "BITSMIST.V1.$CORE"
				}
			},
			{
				file: 'dist/bitsmist-js-extras_v1.esm.min.js',
				format: 'es',
				sourcemap: false,
				plugins: [
					terser({
						format: {comments:false},
						compress: {drop_console:true},
						keep_classnames: true,
					})
				],
			},
			{
				file: 'dist/bitsmist-js-extras_v1.esm.js',
				format: 'es',
				sourcemap: true,
			}
		],
		external: [
			"@bitsmist-js_v1/core"
		],
		plugins: [
			nodeResolve(),
		],
	},
]
