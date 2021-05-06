import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Show from '../../components/show';
import { DropZone } from '../../components/Utils';
import { PDFDocument } from 'pdf-lib';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
const PdfView = dynamic(() => import('../../components/pdfView'), { ssr: false });

const SignerPDF = () => {

    // estados
    const [show_pdf, setShowPdf] = useState(false);
    const [pdf_blob, setPdfBlob] = useState(undefined);
    const [pdf_doc, setPdfDoc] = useState(undefined);
    const [pdf_url, setPdfUrl] = useState("");

    // obtener archivo
    const handleFiles = async (e) => {
        if (e.files.length) {
            let current_file = e.files[0];
            setPdfBlob(current_file);
            setPdfUrl(URL.createObjectURL(current_file));
            let reader = new FileReader();
            await reader.readAsArrayBuffer(current_file);
            reader.onload = async () => {
                let current_pdf_doc = await PDFDocument.load(reader.result);
                setPdfDoc(current_pdf_doc);
                setShowPdf(true);
            }
        }
    }

    // cerrar firma
    const onClose = async (e) => {
        setShowPdf(false);
        setPdfBlob(undefined);
        setPdfDoc(undefined);
        setPdfUrl("");
    }
    
    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                prefix={<i className="fas fa-signature"/>}
                title="Firmar PDF"
                info={["Firmar archivo PDF"]}
                bg="danger"
                options={[]}
            >
                <div className="card-body">
                    <div className="row justify-content-center">
                        <div className="col-md-8 mt-5" style={{ paddingTop: '7em' }}>
                            <DropZone id="files" 
                                name="files"
                                onChange={(e) => handleFiles(e)} 
                                icon="save"
                                title="Select. Archivo Pdf"
                                accept="application/pdf"
                                multiple={false}
                            />  
                        </div>
                    </div>
                </div>
            </BoardSimple>

            <Show condicion={show_pdf}>
                <PdfView
                    pdfBlob={pdf_blob}
                    pdfDoc={pdf_doc}
                    pdfUrl={pdf_url}
                    onClose={onClose}
                />
            </Show>
        </div>
    )
}

// server
SignerPDF.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    return { query, pathname }
}

// exportar
export default SignerPDF;