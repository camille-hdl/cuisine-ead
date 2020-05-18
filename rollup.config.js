import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
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
                    "isValidElement",
                    "createContext",
                ],
                "./node_modules/react-dom/index.js": ["findDOMNode", "unstable_batchedUpdates", "createPortal"],
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
                "./node_modules/react-is/index.js": ["isValidElementType", "isFragment", "ForwardRef", "Memo"],
                "./node_modules/react-redux/node_modules/react-is/index.js": [
                    "isValidElementType",
                    "isContextConsumer",
                ],
                "node_modules/@material-ui/utils/node_modules/react-is/index.js": ["ForwardRef"],
            },
        }),
        babel(),
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
                    unused: false,
                    collapse_vars: false,
                },
                output: {
                    comments: !prod,
                },
                ecma: 8,
                safari10: true,
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
