//@flow
import ajouterAltRender from "./ajouter-alt-render.js";
import corrigerAccessRestrictLigeo from "./corriger-access-restrict-ligeo.js";
import corrigerGenreformPhysdesc from "./corriger-genreform-physdesc.js";
import { pipe } from "ramda";
/**
 * Every ligeo-related recipes
 */
export default () =>
    pipe<any, any, any, any>(ajouterAltRender(), corrigerAccessRestrictLigeo(), corrigerGenreformPhysdesc());
