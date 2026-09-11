/**
 * ESLint 9 flat config.
 * ESLint 10 exists but is skipped: eslint-plugin-ft-flow 3.x, eslint-plugin-react 7.x,
 * and eslint-plugin-jsx-a11y 6.x still declare peer ranges through ESLint 9 only.
 * Prettier stays a separate `npm run prettier` step (Prettier 3 would reformat the tree).
 */
import js from "@eslint/js";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import ftFlow from "eslint-plugin-ft-flow";
import eslintConfigPrettier from "eslint-config-prettier";

const ftFlowRecommendedRules = ftFlow.configs?.["babel-parser"]?.rules ?? {};

export default [
    {
        ignores: [
            "public/**",
            "node_modules/**",
            "cypress/**",
            "jest-coverage/**",
            "cypress-coverage/**",
            "coverage/**",
            "reports/**",
            ".nyc_output/**",
        ],
    },
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx,mjs}"],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
                babelOptions: {
                    presets: ["@babel/preset-react", "@babel/preset-flow"],
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
        plugins: {
            react,
            "jsx-a11y": jsxA11y,
            "ft-flow": fixupPluginRules(ftFlow),
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            ...ftFlowRecommendedRules,
            // eslint-config-prettier still only knows the old `flowtype/*` names
            "ft-flow/boolean-style": "off",
            "ft-flow/delimiter-dangle": "off",
            "ft-flow/generic-spacing": "off",
            "ft-flow/semi": "off",
            "ft-flow/space-after-type-colon": "off",
            "ft-flow/space-before-generic-bracket": "off",
            "ft-flow/space-before-type-colon": "off",
            "ft-flow/union-intersection-spacing": "off",
            "new-cap": [
                "warn",
                {
                    capIsNewExceptions: ["Map", "List", "Set", "Record", "Seq", "OrderedMap", "OrderedSet"],
                },
            ],
            "no-invalid-this": "warn",
            "no-unused-expressions": "warn",
            // ESLint 9 flags unused catch bindings and args that ESLint 7 ignored
            "no-unused-vars": [
                "error",
                {
                    args: "none",
                    caughtErrors: "none",
                    ignoreRestSiblings: true,
                },
            ],
            ...eslintConfigPrettier.rules,
        },
    },
    {
        files: ["src/sw.js"],
        languageOptions: {
            globals: {
                ...globals.serviceworker,
                workbox: "readonly",
            },
        },
    },
    {
        files: ["__tests__/**/*.{js,jsx}", "**/*.{test,tests,spec}.{js,jsx}"],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
];
