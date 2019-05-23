/* eslint-disable */
import { cleanOutputEncoding, genNewFilename, escapeCell, getRange, replaceRange } from "../../src/lib/utils.js";

test("cleanOutputEncoding - windows-1252", () => {
    expect(cleanOutputEncoding("<?xml encoding='Windows-1252' ?>", "windows-1252")).toEqual("<?xml  ?>");
    expect(cleanOutputEncoding("<?xml encoding=\"windows-1252\" ?>", "windows-1252")).toEqual("<?xml  ?>");
});

test("cleanOutputEncoding - ISO-8859-1", () => {
    expect(cleanOutputEncoding("<?xml encoding='iso-8859-1' ?>", "iso-8859-1")).toEqual("<?xml  ?>");
    expect(cleanOutputEncoding("<?xml encoding=\"iso-8859-1\" ?>", "iso-8859-1")).toEqual("<?xml  ?>");
    expect(cleanOutputEncoding("<?xml encoding='ISO-8859-1' ?>", "iso-8859-1")).toEqual("<?xml  ?>");
    expect(cleanOutputEncoding("<?xml encoding=\"ISO-8859-1\" ?>", "iso-8859-1")).toEqual("<?xml  ?>");
});


test("cleanOutputEncoding - utf8", () => {
    expect(cleanOutputEncoding("<?xml encoding=\"UTF-8\" ?>", "utf-8")).toEqual("<?xml  ?>");
    expect(cleanOutputEncoding("<?xml encoding='UTF-8' ?>", "utf-8")).toEqual("<?xml  ?>");
    expect(cleanOutputEncoding("<?xml encoding='utf-8' ?>", "utf-8")).toEqual("<?xml  ?>");
    expect(cleanOutputEncoding("<?xml encoding='utf8' ?>", "utf-8")).toEqual("<?xml  ?>");
    expect(cleanOutputEncoding("<?xml encoding=\"utf8\" ?>", "utf-8")).toEqual("<?xml  ?>");
});

test("genNewFilename", () => {
    expect(genNewFilename("mon-inventaire.xml")).toEqual("mon-inventaire_resu.xml");
    expect(genNewFilename("mon-inventaire.test.xml")).toEqual("mon-inventaire.test_resu.xml");
});

test("escapeCell", () => {
    expect(escapeCell("123")).toEqual('"123"');
    expect(escapeCell("aze\"rty")).toEqual('"aze""rty"');
    expect(escapeCell("aze \"rt az \"\" l'aze- ay")).toEqual('"aze ""rt az "" l\'aze- ay"');
});

test("getRange", () => {
    expect(getRange("3 P 290/1-/3")).toEqual([1, 3]);
    expect(getRange("3 P 290 100-309")).toEqual([100, 309]);
    expect(getRange("3 P 290/100-309")).toEqual([100, 309]);
    expect(getRange("3 P 290/100")).toBeNull();
    expect(getRange("3 P 290 1-/10000")).toEqual([1, 10000]);
});

test("replaceRange", () => {
    expect(replaceRange("3 P 290/1-/3", [2, 3])).toEqual("3 P 290/2-/3");
    expect(replaceRange("3 P 290 100-309", [100, 200])).toEqual("3 P 290 100-200");
    expect(replaceRange("3 P290/100-309", [100, 200])).toEqual("3 P290/100-200");
    expect(replaceRange("3 P 290 1-/10000", [9, 999])).toEqual("3 P 290 9-/999");
});

test("replaceRange - padding and separator", () => {
    expect(replaceRange("3 P 290/1-/3", [2, 3], true, " à ")).toEqual("3 P 290 /2 à /3");
    expect(replaceRange("3 P 290 1-/3", [2, 3], true, " à ")).toEqual("3 P 290 2 à /3");
});