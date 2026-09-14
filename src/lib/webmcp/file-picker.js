//@flow
/**
 * Bridge to the existing react-dropzone `open()` so WebMCP can ask the user
 * to pick files. Programmatic opens are often blocked without a user gesture.
 */

let openPicker: ?() => void = null;

export const setWebmcpFilePicker = (open: ?() => void) => {
    openPicker = open;
};

export type FilePickerResult = {|
    opened: boolean,
    method: string,
    warning: string,
|};

const USER_GESTURE_WARNING =
    "Le navigateur peut bloquer l'ouverture du sélecteur sans geste utilisateur. Si rien ne s'ouvre, demandez à l'utilisateur de cliquer sur « Parcourir les fichiers ». Préférez add_ead_content / add_ead_contents lorsque le XML est déjà dans le contexte de l'agent.";

/**
 * Try the dropzone opener first, then a click on the hidden file input.
 */
export const openWebmcpFilePicker = (): FilePickerResult => {
    if (typeof openPicker === "function") {
        try {
            openPicker();
            return { opened: true, method: "dropzone", warning: USER_GESTURE_WARNING };
        } catch (e) {
            // fall through to the input click
        }
    }
    if (typeof document !== "undefined") {
        const input = document.querySelector("[data-cy=file-uploader] input[type=file]");
        if (input && typeof input.click === "function") {
            input.click();
            return { opened: true, method: "input-click", warning: USER_GESTURE_WARNING };
        }
    }
    return { opened: false, method: "none", warning: USER_GESTURE_WARNING };
};
