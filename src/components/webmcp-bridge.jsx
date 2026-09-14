//@flow
import { useEffect, useLayoutEffect, useRef } from "react";
import { useStore } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { registerWebMcpTools } from "../lib/webmcp/index.js";
import { createPathnameTracker } from "../lib/webmcp/pathname.js";

/**
 * Registers WebMCP tools for the lifetime of the app shell.
 * No UI. Silent no-op when `document.modelContext` is missing.
 */
export default function WebMcpBridge() {
    const store = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const trackerRef = useRef(null);
    if (trackerRef.current === null) {
        trackerRef.current = createPathnameTracker(location.pathname);
    }

    useLayoutEffect(() => {
        trackerRef.current && trackerRef.current.syncFromLocation(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const controller = new AbortController();
        const tracker = trackerRef.current;
        if (!tracker) return undefined;
        registerWebMcpTools({
            store,
            navigate: tracker.wrapNavigate(navigate),
            getPathname: () => tracker.getPathname(),
            signal: controller.signal,
        });
        return () => {
            controller.abort();
        };
    }, [store, navigate]);

    return null;
}
