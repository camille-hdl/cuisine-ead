//@flow
import React from "react";
import { Map } from "immutable";
import TextArg from "./text-arg.jsx";

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
                    <TextArg {...this.props} argName="publisher" label="Publisher" />
                </EventTrap>
            );
        if (this.props.recipe === "ecraser_repository")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="repository" label="Repository" />
                </EventTrap>
            );
        if (this.props.recipe === "ecraser_creation")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="creation" label="Creation" />
                </EventTrap>
            );
        if (this.props.recipe === "ecraser_origination")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="origination" label="Origination (xml)" />
                </EventTrap>
            );
        if (this.props.recipe === "ecraser_date")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="date" label="Date (année)" />
                </EventTrap>
            );
        return null;
    }
}
