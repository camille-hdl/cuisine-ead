import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import nodePolyfills from 'rollup-plugin-polyfill-node';
import clear from "rollup-plugin-clear";
import copy from "rollup-plugin-cpy";
import json from "rollup-plugin-json";

const outputDir = "./public/js/";

const getPluginsConfig = (prod, mini) => {
    const sortie = [
        clear({
            targets: [outputDir + "esm"],
            watch: true,
        }),
        copy({
            files: ["./node_modules/jschardet/dist/jschardet.min.js"],
            dest: outputDir + "vendor",
        }),
        nodeResolve({
            mainFields: ["module", "main", "browser"],
            dedupe: ["react", "react-dom"],
            preferBuiltins: false,
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify(prod ? "production" : "development"),
        }),
        commonjs({
            include: "node_modules/**",
        }),
        babel(),
        nodePolyfills({
            include: null,
        }),
        json({
            preferConst: true,
            compact: true,
            namedExports: true,
        }),
    ];
    if (mini) {
        sortie.push(
            terser({
                compress: {
                    unused: false,
                    collapse_vars: false,
                },
                output: {
                    comments: !prod,
                },
                ecma: 8,
                safari10: true,
            })
        );
    }
    return sortie;
};

export default CLIArgs => {
    const prod = !!CLIArgs.prod;
    const mini = !!CLIArgs.mini;
    const bundle = {
        input: ["./src/index.jsx"],
        output: {
            dir: outputDir + "esm/",
            format: "es",
        },
        watch: {
            include: ["./src/**"],
        },
    };
    bundle.plugins = getPluginsConfig(prod, mini);
    return bundle;
};
