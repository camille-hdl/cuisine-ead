//@flow
import type { Map } from "immutable";
export type Recipe = (doc: any) => any;

/**
 * Contains a single property: `corrections: Map`
 */
export type ExecuteState = Map<string, Map<string, any>>;
