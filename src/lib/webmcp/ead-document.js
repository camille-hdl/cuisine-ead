//@flow
/**
 * WebMCP ingest must only label a document as XML-EAD when the root is EAD.
 * The dropzone still accepts XML by MIME; this check is for add_ead_content(s).
 */

const localNameOf = (root: Element): string => {
    const raw = root.localName || root.tagName || "";
    const parts = String(raw).split(":");
    return parts[parts.length - 1];
};

export const eadRootTag = (doc: Document): string => {
    const root = doc.documentElement;
    if (!root) return "";
    return localNameOf(root);
};

export const isEadDocument = (doc: Document): boolean => {
    return eadRootTag(doc).toLowerCase() === "ead";
};

export const nonEadErrorFromRoot = (received: string): string => {
    const label = received || "(aucun)";
    return (
        "Ce document n'est pas un XML-EAD : l'élément racine doit être <ead> (reçu : <" +
        label +
        ">). Le fichier n'a pas été chargé."
    );
};

export const nonEadError = (doc: Document): string => {
    const root = doc.documentElement;
    return nonEadErrorFromRoot(root ? String(root.tagName) : "(aucun)");
};

const stripXmlProlog = (xml: string): string => {
    return xml
        .replace(/^\uFEFF/, "")
        .replace(/<\?xml[\s\S]*?\?>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
        .trim();
};

/**
 * Best-effort root local name without DOMParser (Jest runs in Node).
 * Production still validates the parsed Document.
 */
export const rootElementLocalNameFromXmlString = (xml: string): string => {
    const body = stripXmlProlog(String(xml || ""));
    const match = body.match(/^<([A-Za-z_][\w:.-]*)/);
    if (!match) return "";
    const parts = match[1].split(":");
    return parts[parts.length - 1];
};

export const isEadXmlString = (xml: string): boolean => {
    return rootElementLocalNameFromXmlString(xml).toLowerCase() === "ead";
};
