import commonjs from '@rollup/plugin-commonjs'
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
				plugins: [
					terser({
						format:				{comments:false},
						compress:			{drop_console:true},
						keep_classnames:	true,
					})
				],
				globals: {
					"@bitsmist-js_v1/core": "BITSMIST.V1.$CORE"
				}
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
						format:				{comments:false},
						compress:			{drop_console:true},
						keep_classnames:	true,
					})
				],
			},
			{
				file: 'dist/bitsmist-js-extras_v1.esm.js',
				format: 'es',
				sourcemap: true,
			}
		],
		plugins: [
			nodeResolve(),
			commonjs()
		],
		external: [
			"@bitsmist-js_v1/core"
		]
	},
]
