//@flow
import React from "react";
import { Map } from "immutable";
import EcraserPublisherArgs from "./ecraser-publisher-args.jsx";
import EcraserRepositoryArgs from "./ecraser-repository-args.jsx";

export type Props = {
    recipe: string,
    args: Map,
    setArgs: (args: Map) => void,
};

function EventTrap(props: { children?: any }) {
    return (
        <div role="presentation" onClick={e => e.stopPropagation()}>
            {props.children ? props.children : null}
        </div>
    );
}
/**
 * UI for recipes with arguments
 */
export default class RecipeArgs extends React.PureComponent<Props> {
    render() {
        if (this.props.recipe === "ecraser_publisher")
            return (
                <EventTrap>
                    <EcraserPublisherArgs {...this.props} />
                </EventTrap>
            );
        if (this.props.recipe === "ecraser_repository")
            return (
                <EventTrap>
                    <EcraserRepositoryArgs {...this.props} />
                </EventTrap>
            );
        return null;
    }
}
