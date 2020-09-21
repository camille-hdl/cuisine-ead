//@flow
import React from "react";
import { Map } from "immutable";
import TextArg from "./text-arg.jsx";

export type Props = {
    recipe: string,
    args: Map<string, mixed>,
    setArgs: (args: Map<string, mixed>) => void,
};

function EventTrap(props: { children?: any }) {
    return (
        <div role="presentation" onClick={(e) => e.stopPropagation()}>
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
        if (this.props.recipe === "geogname_set_source")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="source" label="Valeur de l'attribut" />
                </EventTrap>
            );
        if (this.props.recipe === "ajouter_persname_source")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="role" label="Attribut 'role' recherché" />
                    <TextArg {...this.props} argName="source" label="Valeur de l'attribut 'source'" />
                </EventTrap>
            );
        if (this.props.recipe === "ajouter_typologie_article")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="valeur" label="Contenu du controlaccess genreform" />
                </EventTrap>
            );
        if (this.props.recipe === "transforme_daogrp_ligeo")
            return (
                <EventTrap>
                    <TextArg
                        {...this.props}
                        argName="prefix"
                        label="Préfixe à ajouter au dossier. Laisser vide si inutile."
                    />
                </EventTrap>
            );
        if (this.props.recipe === "origination_from_unittitle")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="titre" label="Titres à ajouter en origination." />
                </EventTrap>
            );
        if (this.props.recipe === "genreform_from_unittitle")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="titre" label="Titres à ajouter en genreform." />
                    <TextArg {...this.props} argName="titre" label="Attribut 'type' à ajouter sur les genreform." />
                </EventTrap>
            );
        if (this.props.recipe === "index_from_unittitle_multi")
            return (
                <EventTrap>
                    <TextArg {...this.props} argName="titres" label="Titres à ajouter en index." />
                    <TextArg {...this.props} argName="index" label="Index controlaccess (par ex: 'genreform')." />
                    <TextArg {...this.props} argName="type" label="Attribut 'type' à ajouter sur les index." />
                    <TextArg
                        {...this.props}
                        argName="separateurs"
                        label="Séparateurs pour diviser le titre en plusieur index (separés par '|')"
                    />
                </EventTrap>
            );
        return null;
    }
}
