//@flow

function hasFathom(): boolean {
    return typeof window.fathom !== "undefined" && typeof window.fathom.trackGoal === "function";
}

function isE2E(): boolean {
    return typeof window.__E2E__ !== "undefined";
}

export function trackGoal(goal: string) {
    if (!hasFathom()) return;
    if (isE2E()) {
        console.log("goal blocked because e2e tests are running");
        return;
    }
    window.fathom.trackGoal(goal, 0);
}
