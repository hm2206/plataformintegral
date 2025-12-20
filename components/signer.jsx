import React from 'react';
import { Form } from 'semantic-ui-react';
import dynamic from 'next/dynamic';

// Import PDFAssembler dynamically to avoid SSR issues
const PDFAssembler = dynamic(
    () => import('pdfassembler').then(mod => mod.PDFAssembler),
    { ssr: false }
);

const Signer = () => {
    if (typeof window === 'object') {
        return (
            <div className="col-md-12 mt-5">
                <iframe
                    src="http://ecat.server.grupo-sm.com/ecat_Documentos/ES147020_011164.pdf"
                    frameBorder="0"
                    width="600px"
                    height="700px"
                />
            </div>
        );
    }

    return (
        <div className="card">
            cargando...
        </div>
    );
}

export default Signer;
