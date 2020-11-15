import React, { Fragment, useContext, useState } from 'react';
import PdfView from '../../components/pdfView';
import Show from '../../components/show';
import { Body, DropZone } from '../../components/Utils';
import { PDFDocument } from 'pdf-lib';
import { Confirm } from '../../services/utils';
import { signature } from '../../services/apis';
import { AppContext } from '../../contexts/AppContext';
import Swal from 'sweetalert2';

const SignerPDF = () => {

    // app
    const app_context = useContext(AppContext);

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

    // obtener firma
    const onSignature = async (e) => {
        let answer = await Confirm("warning", `¿Estás seguro en firmar el PDF?`, 'Firmar');
        if (answer) {
            app_context.fireLoading(true);
            let datos = new FormData;
            datos.append('reason', e.reason);
            datos.append('location', e.location);
            datos.append('page', e.page);
            datos.append('file', e.pdfBlob);
            datos.append('visible', e.visible);
            if (e.position) datos.append('position', e.position);
            await signature.post(`auth/signer`, datos, { responseType: 'blob' })
                .then(res => {
                    let { data } = res;
                    let a = document.createElement('a');
                    a.href = URL.createObjectURL(data);
                    a.target = '__blank';
                    a.download = e.pdfBlob.name;
                    a.click();
                }).catch(err => {
                    try {
                        let { message } = err.response.data;
                        Swal.fire({ icon: 'error', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message });
                    }
                });
            app_context.fireLoading(false);
        }
    }
    
    // render
    return <div className="col-md-12">
        <Body>
            <div className="_card">
                <div className="card-header">
                    <i className="fas fa-signature"></i> Firmar PDF
                </div>
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
            </div>
        </Body>

        <Show condicion={show_pdf}>
            <PdfView
                pdfBlob={pdf_blob}
                pdfDoc={pdf_doc}
                pdfUrl={pdf_url}
                onSignature={onSignature}
                onClose={onClose}
            />
        </Show>
    </div>
}

export default SignerPDF;