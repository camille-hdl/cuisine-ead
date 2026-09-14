//@flow
/**
 * Register Cuisine EAD page tools on `document.modelContext` when WebMCP exists.
 * Unregister via AbortController (React effect cleanup).
 */

import { getModelContext } from "./detect.js";
import { createHandlers } from "./handlers.js";
import { createProductionDeps } from "./runtime.js";
import { createToolDefinitions } from "./tools.js";

export { isWebMcpAvailable, getModelContext } from "./detect.js";
export { setWebmcpFilePicker } from "./file-picker.js";
export { MAX_XML_CHARS } from "./handlers.js";

export type RegisterWebMcpOptions = {|
    store: { getState: () => any, dispatch: (action: any) => any },
    navigate: (to: string) => void,
    getPathname: () => string,
    signal?: AbortSignal,
|};

const registerOneTool = async (modelContext: any, tool: any, signal: ?AbortSignal): Promise<void> => {
    if (signal && signal.aborted) return;
    try {
        await modelContext.registerTool(tool, signal ? { signal } : {});
    } catch (e) {
        const message = e && e.message ? String(e.message) : String(e);
        console.warn("[WebMCP] Impossible d'enregistrer l'outil " + tool.name + " : " + message);
    }
};

/**
 * Feature-detect and register all MVP tools. Resolves immediately if WebMCP
 * is unavailable (no throw, no console noise beyond a debug log).
 */
export const registerWebMcpTools = async (options: RegisterWebMcpOptions): Promise<boolean> => {
    const modelContext = getModelContext();
    if (!modelContext) {
        return false;
    }
    if (options.signal && options.signal.aborted) {
        return false;
    }
    const deps = createProductionDeps({
        store: options.store,
        navigate: options.navigate,
        getPathname: options.getPathname,
    });
    const tools = createToolDefinitions(createHandlers(deps));
    await Promise.all(tools.map((tool) => registerOneTool(modelContext, tool, options.signal)));
    return true;
};
