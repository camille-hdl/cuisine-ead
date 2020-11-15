//@flow

function hasFathom(): boolean {
    return typeof window.fathom !== "undefined" && typeof window.fathom.trackGoal === "function";
}

function hasCypress(): boolean {
    return typeof window.Cypress !== "undefined";
}

export function trackGoal(goal: string) {
    if (!hasFathom()) return;
    if (hasCypress()) {
        console.log("goal blocked because Cypress is present");
        return;
    }
    window.fathom.trackGoal(goal, 0);
}
