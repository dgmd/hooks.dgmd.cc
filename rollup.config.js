import terser from '@rollup/plugin-terser';

import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json' assert { type: "json" };

export default [
  {
    input: 'app/hook/notionDataHook.js',
    output: {
      file: pkg.main,
      format: 'esm'
    },
    plugins: [
      resolve(),
      commonjs(),
      json(),
      terser()
    ],
    external: [
      "react",
      "react-dom"
    ]
  },
];
