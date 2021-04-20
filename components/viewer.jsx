import React from 'react';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const Viewer = () => {
    const docs = [
        { uri: "/carta.docx", fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
    ];
    
    return <DocViewer documents={docs} 
        pluginRenderers={DocViewerRenderers}
    />;
}

export default Viewer;