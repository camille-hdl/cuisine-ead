//@flow
import React from "react";

type Props = {
    children: ?any,
    drawer: ?any,
};

export default function PreviewLayout(props: Props) {
    const { children, drawer } = props;
    return (
        <div className="preview-layout">
            <aside className="preview-aside" aria-label="Recettes à comparer">
                {drawer}
            </aside>
            <div className="preview-main">{children}</div>
        </div>
    );
}
