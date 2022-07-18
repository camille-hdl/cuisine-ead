//@flow
import React from "react";
import type { Props } from "./recipe-args.jsx";
import DelayedTestField from "./delayed-text-field.jsx";
import { List, Map } from "immutable";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";

function getNewRemplacement() {
    return { rechercher: "", remplacer: ""};
}

export default class RechRemplacerDaoHrefArgs extends React.PureComponent<Props> {
    render() {
        let remplacements = this.props.args.get("remplacements");
        if (!remplacements || remplacements.length <= 0) {
            remplacements = [ getNewRemplacement() ];
        }
        return <>
            {remplacements.map((remplacement, index) => {
                return <div key={index}>
                    <DelayedTestField
                        label="Rechercher"
                        value={remplacement.rechercher}
                        onChange={value => {
                            let newRemplacements = [...remplacements];
                            newRemplacements[index].rechercher = value;
                            if (newRemplacements[index].rechercher === "" && newRemplacements[index].remplacer === "") {
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
                        onChange={value => {
                            let newRemplacements = [...remplacements];
                            newRemplacements[index].remplacer = value;
                            if (newRemplacements[index].rechercher === "" && newRemplacements[index].remplacer === "") {
                                if (newRemplacements.length > 1) {
                                    newRemplacements.splice(index, 1);
                                }
                            }
                            this.props.setArgs(this.props.args.set("remplacements", newRemplacements));
                        }}
                    />
                </div>;
            })}
            <IconButton onClick={() => {
                this.props.setArgs(this.props.args.update("remplacements", remplacements => [...remplacements, getNewRemplacement()]));
            }}>
                <Icon>add</Icon>
            </IconButton>
        </>;
    }
}