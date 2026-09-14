//@flow
import {
    xmlFilesSelector,
    pipelineFnSelector,
    outputPipelineFnSelector,
    fullRecipeSelector,
    correctionsSelector,
} from "../../selectors.js";
import { xmlStringToFileData } from "./parse-xml.js";
import { openWebmcpFilePicker } from "./file-picker.js";
import type { WebmcpDeps } from "./handlers.js";

const processFileFromState = (getState: () => any) => {
    return (xmlFile: any): string => {
        const state = getState();
        const pipelineFn = pipelineFnSelector(state);
        const outputPipelineFn = outputPipelineFnSelector(state);
        if (!pipelineFn) {
            return String(xmlFile.get("string") || "");
        }
        const processedDoc = pipelineFn(xmlFile);
        const serializer = new XMLSerializer();
        return outputPipelineFn(serializer.serializeToString(processedDoc));
    };
};

const downloadResultsFromStore = (getState: () => any) => {
    return () => {
        return import("../../pages/results.jsx").then((mod) => {
            const state = getState();
            mod.downloadResultsZip({
                xmlFiles: xmlFilesSelector(state),
                pipelineFn: pipelineFnSelector(state),
                outputPipelineFn: outputPipelineFnSelector(state),
                corrections: correctionsSelector(state),
                fullRecipe: fullRecipeSelector(state),
            });
        });
    };
};

/**
 * Production collaborators: Redux store, react-router navigate, real XML parse.
 */
export const createProductionDeps = (options: {|
    store: { getState: () => any, dispatch: (action: any) => any },
    navigate: (to: string) => void,
    getPathname: () => string,
|}): WebmcpDeps => {
    const { store, navigate, getPathname } = options;
    return {
        getState: () => store.getState(),
        dispatch: (action) => store.dispatch(action),
        navigate,
        getPathname,
        parseXml: xmlStringToFileData,
        processFile: processFileFromState(() => store.getState()),
        downloadResults: downloadResultsFromStore(() => store.getState()),
        openFilePicker: openWebmcpFilePicker,
    };
};
