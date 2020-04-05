//@flow
/**
 * Taken from https://github.com/chrisbottin/xml-formatter
 * modifications:
 * * `newLine` option
 * * no newline on content nodes if content is empty or whitespace characters
 * * no double newLines
 * * changed the behavior of `collapseContent` to ignore empty text nodes
 */
import parse from "xml-parser-xo";

const NEWLINE = "\r\n";

function newLine(output) {
    if (!lastCharacterIsNewLine(output)) {
        output.content += output.options.newLine;
    }
    var i;
    for (i = 0; i < output.level; i++) {
        output.content += output.options.indentation;
    }
}

function appendContent(output, content) {
    output.content += content;
}

function processNode(node, output, preserveSpace) {
    if (node.name === "#text" || node.name === "#comment") {
        processContentNode(node, output, preserveSpace);
    } else {
        // Assuming that we only have 3 types of node (#text, #comment and element)
        processElement(node, output, preserveSpace);
    }
}

function processContentNode(node, output, preserveSpace) {
    if (node.content.trim() === "") return;
    if (!preserveSpace && output.content.length > 0) {
        newLine(output);
    }
    const trimFunction = preserveSpace
        ? (str) => {
              // remove newLines and multiple whitespace characters
              return str.replace(/(\r\n)|\n/g, "").replace(/\s+/g, " ");
          }
        : (str) => str.trim();
    appendContent(output, trimFunction(node.content));
}
function lastCharacterIsNewLine(output) {
    return output.content.endsWith(output.options.newLine);
}

function processElement(node, output, preserveSpace) {
    if (!preserveSpace && output.content.length > 0) {
        newLine(output);
    }

    appendContent(output, "<" + node.name);
    processAttributes(output, node.attributes);

    if (node.children === null) {
        // self-closing node
        appendContent(output, "/>");
    } else {
        appendContent(output, ">");

        output.level++;

        var nodePreserveSpace = node.attributes["xml:space"] === "preserve";

        if (!nodePreserveSpace && output.options.collapseContent) {
            var containsTextNodes = node.children.some(function (child) {
                return child.name === "#text" && child.content.trim() !== "";
            });

            if (containsTextNodes) {
                nodePreserveSpace = true;
            }
        }

        node.children.forEach(function (child) {
            processNode(child, output, preserveSpace || nodePreserveSpace);
        });

        output.level--;

        if (!preserveSpace && !nodePreserveSpace) {
            newLine(output);
        }
        appendContent(output, "</" + node.name + ">");
    }
}

function processAttributes(output, attributes) {
    Object.keys(attributes).forEach(function (attr) {
        appendContent(output, " " + attr + '="' + attributes[attr] + '"');
    });
}

function processDeclaration(declaration, output) {
    if (declaration) {
        appendContent(output, "<?xml");
        processAttributes(output, declaration.attributes);
        appendContent(output, "?>");
    }
}
type FormatOptionsInput = {
    debug?: boolean,
    indentation?: string,
    stripComments?: boolean,
    collapseContent?: boolean,
    newLine?: string,
};
type FormatOptions = {
    debug: boolean,
    indentation: string,
    stripComments: boolean,
    collapseContent: boolean,
    newLine: string,
};
const applyDefaults = (options: FormatOptionsInput): FormatOptions => {
    const defaults: FormatOptions = {
        debug: false,
        indentation: "    ",
        stripComments: true,
        collapseContent: true,
        newLine: NEWLINE,
    };
    const output = { ...defaults, ...options };
    return output;
};
/**
 * Converts the given XML into human readable format.
 *
 * @param {String} xml
 * @param {Object} options
 *  @config {Boolean} [debug=false] displays a tree of the parsed XML before formatting
 *  @config {String} [indentation='    '] The value used for indentation
 *  @config {String} [newLine="\n"] The value used for new lines
 *  @config {Boolean} [stripComments=false] True to strip the comments
 *  @config {Boolean} [collapseContent=false] True to keep content in the same line as the element. Only works if element contains at least one text node
 * @returns {string}
 */
export default function format(xml: string, inputOptions: FormatOptionsInput) {
    const options = applyDefaults(inputOptions);

    var parsedXml = parse(xml, { stripComments: options.stripComments });

    var output = { content: "", level: 0, options: options };

    processDeclaration(parsedXml.declaration, output);
    parsedXml.children.forEach(function (child) {
        processNode(child, output, false);
    });

    return output.content;
}
