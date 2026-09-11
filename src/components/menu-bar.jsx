//@flow
import React from "react";
import { Link as RouterLink } from "react-router-dom";

export default function MenuBar(props: { version: string, newVersionAvailable: boolean }) {
    const { version, newVersionAvailable } = props;
    return (
        <header className="site-header">
            <div className="site-header-inner">
                <RouterLink to="/" className="site-wordmark">
                    {"Cuisine EAD 🍲"}
                </RouterLink>
                <div className="site-meta">
                    {newVersionAvailable ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            title="Recharger la page"
                            onClick={() => {
                                window.location.reload();
                            }}
                        >
                            {"Nouvelle version disponible — recharger"}
                        </button>
                    ) : null}
                    <a
                        href={"https://github.com/camille-hdl/cuisine-ead/issues"}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Signaler un bug ou demander une fonctionnalité
                    </a>
                    <span>{`v${version}`}</span>
                </div>
            </div>
        </header>
    );
}
