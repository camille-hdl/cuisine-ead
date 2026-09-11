//@flow
import React from "react";

export default function Loading() {
    return (
        <div className="loading" role="status">
            <span className="spinner" aria-hidden="true" />
            <span>Chargement…</span>
        </div>
    );
}
