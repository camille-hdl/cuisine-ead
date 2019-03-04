/* eslint-disable */
import { cleanOutputEncoding, genNewFilename, escapeCell } from "../../src/lib/utils.js";

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