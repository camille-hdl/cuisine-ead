//@flow

/**
 * Replace windows-specific characters (windows-1252) with their ISO-8859-1 counterparts
 */
export const replaceMSChars = (text: string): string => {
    var s = text;
    // smart single quotes and apostrophe
    s = s.replace(/[\u2018\u2019\u201A\u00B4]/g, "'");
    // smart double quotes
    s = s.replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"');
    // ellipsis
    s = s.replace(/\u2026/g, "...");
    // oe
    s = s.replace(/\u0153/g, "oe");
    // OE
    s = s.replace(/\u0152/g, "OE");
    // dashes
    s = s.replace(/[\u2013\u2014]/g, "-");
    // circumflex
    s = s.replace(/\u02C6/g, "^");
    // open angle bracket
    s = s.replace(/\u2039/g, "<");
    // close angle bracket
    s = s.replace(/\u203A/g, ">");
    // spaces
    s = s.replace(/[\u02DC\u00A0]/g, " ");

    return s;
};
