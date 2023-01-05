/** @format */

import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import filesize from "rollup-plugin-filesize";
import dts from "rollup-plugin-dts";
import {defineConfig} from "rollup";
import {terser} from "rollup-plugin-terser";
import clear from "rollup-plugin-clear";

export default defineConfig([
    {
        input: "src/index.ts",
        output: [
            {
                file: "lib/index.min.js",
                name: "axios-cache-data",
                format: "esm"
            }
        ],
        external: ["axios"],
        plugins: [
            resolve(),
            typescript(),
            filesize(),
            terser(),
            clear({
                targets: ["lib"],
                watch: true
            })
        ]
    },
    {
        input: "src/index.ts",
        plugins: [dts()],
        output: {
            format: "esm",
            file: "lib/index.d.ts"
        }
    }
]);
