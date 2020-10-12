//@flow
import React from "react";
import { Map } from "immutable";
import TextArg from "./text-arg.jsx";

export type Props = {
    recipe: string,
    args: Map<string, mixed>,
    setArgs: (args: Map<string, mixed>) => void,
};

/**
 * UI for recipes with arguments
 */
export default function RecipeArgs(props: Props) {
    const argumentList = <ArgumentList {...props} />;
    return argumentList ? <EventTrap>{argumentList}</EventTrap> : null;
}

function ArgumentList(props: Props) {
    if (props.recipe === "ecraser_publisher") return <EcraserPublisherArg {...props} />;
    if (props.recipe === "ecraser_repository") return <EcraserRepositoryArg {...props} />;
    if (props.recipe === "ecraser_creation") return <EcraserCreationArg {...props} />;
    if (props.recipe === "ecraser_origination") return <EcraserOriginationArg {...props} />;
    if (props.recipe === "ecraser_date") return <EcraserDateArg {...props} />;
    if (props.recipe === "geogname_set_source") return <GeognameSetSourceArg {...props} />;
    if (props.recipe === "ajouter_persname_source") return <AjouterPersnameSourceArgs {...props} />;
    if (props.recipe === "ajouter_typologie_article") return <AjouterTypologieArticleArgs {...props} />;
    if (props.recipe === "transforme_daogrp_ligeo") return <TransformeDaogrpLigeoArgs {...props} />;
    if (props.recipe === "origination_from_unittitle") return <OriginationFromUnittitleArgs {...props} />;
    if (props.recipe === "genreform_from_unittitle") return <GenreformFromUnititleArgs {...props} />;
    if (props.recipe === "index_from_unittitle_multi") return <IndexFromUnittitleMultiArgs {...props} />;
    return null;
}

function EventTrap(props: { children?: any }) {
    return (
        <div role="presentation" onClick={(e) => e.stopPropagation()}>
            {props.children ? props.children : null}
        </div>
    );
}

function EcraserPublisherArg(props: Props) {
    return <TextArg {...props} argName="publisher" label="Publisher" />;
}

function EcraserRepositoryArg(props: Props) {
    return <TextArg {...props} argName="repository" label="Repository" />;
}

function EcraserCreationArg(props: Props) {
    return <TextArg {...props} argName="creation" label="Creation" />;
}
function EcraserOriginationArg(props: Props) {
    return <TextArg {...props} argName="origination" label="Origination (xml)" />;
}

function EcraserDateArg(props: Props) {
    return <TextArg {...props} argName="date" label="Date (année)" />;
}

function GeognameSetSourceArg(props: Props) {
    return <TextArg {...props} argName="source" label="Valeur de l'attribut" />;
}

function AjouterPersnameSourceArgs(props: Props) {
    return (
        <>
            <TextArg {...props} argName="role" label="Attribut 'role' recherché" />
            <TextArg {...props} argName="source" label="Valeur de l'attribut 'source'" />
        </>
    );
}

function AjouterTypologieArticleArgs(props: Props) {
    return <TextArg {...props} argName="valeur" label="Contenu du controlaccess genreform" />;
}

function TransformeDaogrpLigeoArgs(props: Props) {
    return <TextArg {...props} argName="prefix" label="Préfixe à ajouter au dossier. Laisser vide si inutile." />;
}

function OriginationFromUnittitleArgs(props: Props) {
    return <TextArg {...props} argName="titre" label="Titres à ajouter en origination." />;
}

function GenreformFromUnititleArgs(props: Props) {
    return (
        <>
            <TextArg {...props} argName="titre" label="Titres à ajouter en genreform." />
            <TextArg {...props} argName="titre" label="Attribut 'type' à ajouter sur les genreform." />
        </>
    );
}

function IndexFromUnittitleMultiArgs(props: Props) {
    return (
        <>
            <TextArg {...props} argName="titres" label="Titres à ajouter en index." />
            <TextArg {...props} argName="index" label="Index controlaccess (par ex: 'genreform')." />
            <TextArg {...props} argName="type" label="Attribut 'type' à ajouter sur les index." />
            <TextArg
                {...props}
                argName="separateurs"
                label="Séparateurs pour diviser le titre en plusieur index (separés par '|')"
            />
        </>
    );
}
