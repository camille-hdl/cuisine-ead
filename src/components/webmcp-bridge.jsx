//@flow
import { useEffect, useRef } from "react";
import { useStore } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { registerWebMcpTools } from "../lib/webmcp/index.js";

/**
 * Registers WebMCP tools for the lifetime of the app shell.
 * No UI. Silent no-op when `document.modelContext` is missing.
 */
export default function WebMcpBridge() {
    const store = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const pathnameRef = useRef(location.pathname);
    pathnameRef.current = location.pathname;

    useEffect(() => {
        const controller = new AbortController();
        registerWebMcpTools({
            store,
            navigate,
            getPathname: () => pathnameRef.current,
            signal: controller.signal,
        });
        return () => {
            controller.abort();
        };
    }, [store, navigate]);

    return null;
}
