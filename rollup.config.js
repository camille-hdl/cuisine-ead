import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import replace from "rollup-plugin-replace";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import clear from "rollup-plugin-clear";
import copy from "rollup-plugin-cpy";
import json from "rollup-plugin-json";

const outputDir = "./public/js/";

const getPluginsConfig = (prod, mini) => {
    const sortie = [
        clear({
            targets: [outputDir + "esm", outputDir + "system"],
            watch: true,
        }),
        copy({
            files: ["./node_modules/jschardet/dist/jschardet.min.js"],
            dest: outputDir + "vendor",
        }),
        nodeResolve({
            mainFields: ["module", "main", "browser"],
            dedupe: ["react", "react-dom"],
            preferBuiltins: true,
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify(prod ? "production" : "development"),
        }),
        commonjs({
            include: "node_modules/**",
            namedExports: {
                "./node_modules/react/index.js": [
                    "cloneElement",
                    "createElement",
                    "PropTypes",
                    "Children",
                    "Component",
                    "createFactory",
                    "PureComponent",
                    "lazy",
                    "Suspense",
                    "useState",
                    "useEffect",
                    "useLayoutEffect",
                    "useCallback",
                    "useMemo",
                    "useContext",
                    "useReducer",
                    "useRef",
                    "useImperativeHandle",
                    "useDebugValue",
                    "memo",
                    "forwardRef",
                    "Fragment",
                ],
                "./node_modules/react-dom/index.js": ["findDOMNode", "unstable_batchedUpdates"],
                "./node_modules/immutable/dist/immutable.js": ["Map", "List", "Set", "fromJS", "Record"],
                "./node_modules/babel-runtime/node_modules/core-js/library/modules/es6.object.to-string.js": [
                    "default",
                ],
                "./node_modules/rxjs/Subject.js": ["Subject"],
                "./node_modules/process/browser.js": ["nextTick"],
                "./node_modules/events/events.js": ["EventEmitter"],
                "./node_modules/@material-ui/core/styles/index.js": [
                    "withStyles",
                    "createMuiTheme",
                    "MuiThemeProvider",
                ],
                "./node_modules/react-is/index.js": ["isValidElementType"],
                "./node_modules/react-redux/node_modules/react-is/index.js": [
                    "isValidElementType",
                    "isContextConsumer",
                ],
            },
        }),
        babel({
            exclude: "node_modules/**",
        }),
        globals(),
        builtins(),
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
                    // screw_ie8: true,
                    // unused: false,
                    // dead_code: false,
                    // conditionals: false,
                    // warnings: false,
                    // defaults: true,
                    unused: false,
                    collapse_vars: false,
                    // computed_props: false,
                    // hoist_props: false,
                    // reduce_vars: false,
                    // pure_getters: false,
                    // evaluate: false,
                    // dead_code: false,
                    // arrows: true,
                    // if_return: true,
                    // properties: false
                },
                output: {
                    comments: !prod,
                },
                sourcemap: true,
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
        output: [
            {
                dir: outputDir + "system/",
                format: "system",
            },
            {
                dir: outputDir + "esm/",
                format: "es",
            },
        ],
        watch: {
            include: ["./src/**"],
        },
    };
    bundle.plugins = getPluginsConfig(prod, mini);
    return bundle;
};
