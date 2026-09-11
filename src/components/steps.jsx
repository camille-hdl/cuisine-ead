//@flow
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const STEPS = [
    { label: "Fichiers", path: "/" },
    { label: "Recettes", path: "/recettes" },
    { label: "Résultats", path: "/resultats" },
];

export default function Steps(props: { activeStep: number, children?: any, canNavigate?: boolean }) {
    const { activeStep, children, canNavigate } = props;
    return (
        <nav className="steps" aria-label="Progression">
            <ol className="steps-list">
                {STEPS.map((step, index) => {
                    const isCurrent = index === activeStep;
                    const isDone = index < activeStep;
                    const className = isCurrent ? "is-current" : isDone ? "is-done" : "";
                    const label = (
                        <>
                            <span className="steps-num" aria-hidden="true">
                                {index + 1}
                            </span>
                            {step.label}
                        </>
                    );
                    return (
                        <li key={step.path} className={className} aria-current={isCurrent ? "step" : undefined}>
                            {canNavigate && !isCurrent ? <RouterLink to={step.path}>{label}</RouterLink> : label}
                        </li>
                    );
                })}
            </ol>
            {children ? <div className="steps-actions">{children}</div> : null}
        </nav>
    );
}
