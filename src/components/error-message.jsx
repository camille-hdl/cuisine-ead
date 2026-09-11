//@flow
import React from "react";

export default function ErrorMessage(props: { message: ?string }) {
    const { message } = props;
    return (
        <section className="notice notice-error" role="alert">
            <h2>Erreur</h2>
            <p>{message ? message : "Une erreur s'est produite. Veuillez recommencer le traitement."}</p>
        </section>
    );
}
