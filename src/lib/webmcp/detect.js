//@flow

export type ModelContextApi = {
    registerTool: (tool: any, options?: any) => Promise<mixed>,
    getTools?: (options?: any) => Promise<mixed>,
    executeTool?: (tool: any, input?: any, options?: any) => Promise<mixed>,
};

/**
 * Feature-detect `document.modelContext` (Chrome / W3C WebMCP).
 * Missing API → silent no-op at the call site.
 */
export const getModelContext = (): ?ModelContextApi => {
    if (typeof document === "undefined") return null;
    const modelContext = (document: any).modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") {
        return null;
    }
    return modelContext;
};

export const isWebMcpAvailable = (): boolean => getModelContext() !== null;
