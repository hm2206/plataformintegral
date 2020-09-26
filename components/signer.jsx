import React from 'react';
import { Form } from 'semantic-ui-react';
import { PDFAssembler } from 'pdfassembler';
import fileSaver from 'file-saver';
import dynamic from 'next/dynamic';
const { PDFReader } = dynamic(() => import('reactjs-pdf-view'), { ssr: false });

const Signer = () => {
    
    if (typeof window == 'object')return <div className="col-md-12 mt-5">
      <iframe src="http://ecat.server.grupo-sm.com/ecat_Documentos/ES147020_011164.pdf" 
        frameborder="0"
        width="600px"
        height="700px"
      />
      {/* <PDFReader url={``}/> */}
  </div>

  return <div className="card">
    cargando...
  </div>
}


export default Signer;