import React from 'react';
import dynamic from 'next/dynamic';

const DocViewer = dynamic(
    () => import('react-doc-viewer').then(mod => mod.default),
    { ssr: false, loading: () => <div>Cargando visor...</div> }
);

const DocViewerRenderers = dynamic(
    () => import('react-doc-viewer').then(mod => mod.DocViewerRenderers),
    { ssr: false }
);

const Viewer = () => {
    const docs = [
        { uri: "/carta.docx", fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
    ];

    if (typeof window === 'undefined') {
        return <div>Cargando...</div>;
    }

    return <DocViewer documents={docs} />;
}

export default Viewer;
