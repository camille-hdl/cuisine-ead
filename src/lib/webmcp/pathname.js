//@flow
/**
 * React Router's location.pathname only updates after a re-render. WebMCP
 * tools call navigate() then get_app_state() in the same turn, so we remember
 * the intended path until the router catches up (or the user navigates elsewhere).
 */

export const pathnameFromTarget = (to: mixed): string => {
    if (typeof to === "string") {
        const noHash = to.split("#")[0];
        const path = noHash.split("?")[0];
        return path || "/";
    }
    if (to && typeof to === "object" && typeof (to: any).pathname === "string") {
        return (to: any).pathname || "/";
    }
    return "/";
};

export type PathnameTracker = {|
    getPathname: () => string,
    syncFromLocation: (pathname: string) => void,
    wrapNavigate: (navigate: (to: any) => mixed) => (to: any) => mixed,
|};

export const createPathnameTracker = (initialPath: string): PathnameTracker => {
    let path = initialPath || "/";
    return {
        getPathname: () => path,
        syncFromLocation: (pathname: string) => {
            path = pathname || "/";
        },
        wrapNavigate: (navigate) => (to) => {
            path = pathnameFromTarget(to);
            return navigate(to);
        },
    };
};

export type NavigationMirror = {|
    navigate: (to: string) => void,
    getPathname: () => string,
|};

/**
 * Prefer the path we just navigated to while getPathname() still returns the
 * previous location. Once the router reports the new path, or a different
 * path (UI navigation), trust getPathname() again.
 */
export const createNavigationMirror = (getPathname: () => string, navigate: (to: string) => void): NavigationMirror => {
    let overridePath: ?string = null;
    let pathWhenNavigated: ?string = null;
    return {
        navigate: (to: string) => {
            const target = pathnameFromTarget(to);
            pathWhenNavigated = getPathname();
            overridePath = target;
            navigate(target);
        },
        getPathname: () => {
            const live = getPathname();
            if (overridePath == null) {
                return live;
            }
            if (live === overridePath) {
                overridePath = null;
                pathWhenNavigated = null;
                return live;
            }
            if (live === pathWhenNavigated) {
                return overridePath;
            }
            overridePath = null;
            pathWhenNavigated = null;
            return live;
        },
    };
};
