import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts';
import pkg from './package.json';

export default [
  {
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    input: `src/${process.env.inputFolder}/index.ts`,
    output: [
      { file: `./dist/${process.env.inputFolder}/bundle.js`, format: 'cjs' }
    ],
    plugins: [
      ts(),
      json(),
      resolve({ extensions: ['.js','.ts'] }),
      commonjs()
    ]
  }
]
