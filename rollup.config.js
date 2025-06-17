import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser'; // Uncommented for production builds

import pkg from './package.json' with { type: "json" };

export default [
  {
    input: 'app/export.js', // Your client-side entry file
    output: {
      file: pkg.main,
      format: 'esm', // Or 'umd', 'iife' depending on your target environment
      sourcemap: true, // Useful for debugging
    },
    plugins: [
      // Configure @rollup/plugin-node-resolve for browser environments
      resolve({
        browser: true, // This is crucial: it tells Rollup to prefer browser-specific module versions
        preferBuiltins: false, // This tells Rollup *not* to bundle Node.js built-ins automatically
        // You can add 'mainfields' if you have specific preferences, e.g.:
        // mainFields: ['browser', 'module', 'main'],
      }),
      commonjs(), // Converts CommonJS modules to ES modules
      json(), // Allows importing JSON files
      // Uncomment terser for production builds to minify the output
      // terser(),
    ],
    external: [
      "react",
      "react-dom"
    ]
  },
];
