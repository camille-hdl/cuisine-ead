//@flow
import React from "react";

export default function Loading(props: { isLoading: boolean, timedOut: boolean, error: boolean }) {
    if (props.isLoading) {
        if (props.timedOut) {
            return <div>{"Une erreur s'est produite (timeout)"}</div>;
        } else if (props.pastDelay) {
            return <div>Chargement...</div>;
        } else {
            return null;
        }
    } else if (props.error) {
        return <div>{"Une erreur s'est produite (error)"}</div>;
    } else {
        return null;
    }
}
