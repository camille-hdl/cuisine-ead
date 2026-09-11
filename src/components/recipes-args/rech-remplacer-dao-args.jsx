//@flow
import React from "react";
import type { Props } from "./recipe-args.jsx";
import DelayedTestField from "./delayed-text-field.jsx";

function getNewRemplacement() {
    return { rechercher: "", remplacer: "" };
}

export default class RechRemplacerDaoHrefArgs extends React.PureComponent<Props> {
    render() {
        let remplacements = this.props.args.get("remplacements");
        if (!remplacements || remplacements.length <= 0) {
            remplacements = [getNewRemplacement()];
        }
        return (
            <>
                {remplacements.map((remplacement, index) => {
                    return (
                        <div className="replace-row" key={index}>
                            <DelayedTestField
                                label="Rechercher"
                                value={remplacement.rechercher}
                                onChange={(value) => {
                                    let newRemplacements = [...remplacements];
                                    newRemplacements[index].rechercher = value;
                                    if (
                                        newRemplacements[index].rechercher === "" &&
                                        newRemplacements[index].remplacer === ""
                                    ) {
                                        if (newRemplacements.length > 1) {
                                            newRemplacements.splice(index, 1);
                                        }
                                    }
                                    this.props.setArgs(this.props.args.set("remplacements", newRemplacements));
                                }}
                            />
                            <DelayedTestField
                                label="Remplacer par"
                                value={remplacement.remplacer}
                                onChange={(value) => {
                                    let newRemplacements = [...remplacements];
                                    newRemplacements[index].remplacer = value;
                                    if (
                                        newRemplacements[index].rechercher === "" &&
                                        newRemplacements[index].remplacer === ""
                                    ) {
                                        if (newRemplacements.length > 1) {
                                            newRemplacements.splice(index, 1);
                                        }
                                    }
                                    this.props.setArgs(this.props.args.set("remplacements", newRemplacements));
                                }}
                            />
                        </div>
                    );
                })}
                <button
                    type="button"
                    className="btn"
                    onClick={() => {
                        this.props.setArgs(
                            this.props.args.update("remplacements", (current) => [...current, getNewRemplacement()])
                        );
                    }}
                >
                    Ajouter un remplacement
                </button>
            </>
        );
    }
}
