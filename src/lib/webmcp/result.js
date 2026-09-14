//@flow

/**
 * WebMCP `execute` should return a string (Chrome `executeTool` → DOMString).
 * Always JSON so an agent can parse success and errors the same way.
 */
export const toolOk = (payload: { [string]: mixed }): string => {
    return JSON.stringify({ ok: true, ...payload });
};

export const toolErr = (error: string, extra?: { [string]: mixed }): string => {
    return JSON.stringify({ ok: false, error, ...(extra || {}) });
};

export const wrapExecute = (fn: (input: any) => mixed | Promise<mixed>) => {
    return async (input: any, options: ?{ signal?: AbortSignal }): Promise<string> => {
        try {
            if (options && options.signal && options.signal.aborted) {
                const abortError: any = new Error("Aborted");
                abortError.name = "AbortError";
                throw abortError;
            }
            const result = await fn(input || {});
            return typeof result === "string" ? result : toolOk({ result });
        } catch (e) {
            if (e && e.name === "AbortError") {
                throw e;
            }
            const message = e && e.message ? String(e.message) : String(e);
            return toolErr(message);
        }
    };
};
