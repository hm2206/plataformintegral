import React, { useState, useContext } from 'react';
import { tramite } from '../services/apis';
import Show from './show';
import { AppContext } from '../contexts/AppContext';
import { Confirm } from '../services/utils';
import Swal from 'sweetalert2';
import axios from 'axios';
import PdfView from './pdfView';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';

const infos = {
    pdf: {
        icon: "fas fa-file-pdf",
        color: "tw-text-red-500",
        bg: "tw-bg-red-50"
    },
    docx: {
        icon: "fas fa-file-word",
        color: "tw-text-blue-500",
        bg: "tw-bg-blue-50",
        hidden: ['signer']
    },
    doc: {
        icon: "fas fa-file-word",
        color: "tw-text-blue-500",
        bg: "tw-bg-blue-50",
        hidden: ['signer']
    },
    xlsx: {
        icon: "fas fa-file-excel",
        color: "tw-text-green-500",
        bg: "tw-bg-green-50",
        hidden: ['signer']
    },
    xls: {
        icon: "fas fa-file-excel",
        color: "tw-text-green-500",
        bg: "tw-bg-green-50",
        hidden: ['signer']
    },
    default: {
        icon: "fas fa-file",
        color: "tw-text-gray-500",
        bg: "tw-bg-gray-50"
    }
}

const ItemFileCircle = ({ id, url, name, extname, is_observation = "", edit = false, hidden = [], onAction = null, onClick = null }) => {

    // add
    const app_context = useContext(AppContext);

    // estados
    const [pdf_url, setPdfUrl] = useState("");
    const [pdf_doc, setPdfDoc] = useState(undefined);
    const [pdf_blob, setPdfBlob] = useState(undefined);
    const [show_signed, setShowSigned] = useState(false);

    // meta información
    let meta_info = infos[extname] || infos.default;

    // eliminar archivo
    const deleteFile = async () => {
        let answer = await Confirm(`warning`, `¿Estás seguro en eliminar el archivo "${name}"?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            await tramite.post(`file/${id}/destroy`)
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    if (typeof onAction == 'function') onAction('delete');
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);
                        throw new Error(data.message);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }

    // generar para pdf
    const generateVisorPDF = async (file, blob) => {
        let reader = new FileReader();
        await reader.readAsArrayBuffer(file);
        reader.onload = async () => {
            let url = await URL.createObjectURL(blob);
            let pdfDoc = await PDFDocument.load(reader.result);
            setPdfDoc(pdfDoc);
            setPdfBlob(file);
            setPdfUrl(url);
            setShowSigned(true);
        }
    }

    // generar firma al pdf
    const handleSignaturePDF = async () => {
        app_context.setCurrentLoading(true);
        await axios.get(url, { responseType: 'blob' })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let blob = res.data;
                blob.lastModifiedDate = new Date();
                blob.name = name;
                let file = new File([blob], name);
                await generateVisorPDF(file, blob)
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: 'no se pudó obtener el archivo' })
                setShowSigned(false);
            });
    }

    // actualizar pdf firmado
    const signaturePDF = async (payload, blob) => {
        app_context.setCurrentLoading(true);
        blob.lastModifiedDate = new Date();
        let file = new File([blob], name);
        let datos = new FormData();
        datos.append('file', file);
        await tramite.post(`file/${id}/update`, datos)
            .then(async res => {
                let newFile = res.data.file;
                app_context.setCurrentLoading(false);
                await Swal.fire({ icon: 'success', text: 'El archivo se firmó correctamente!' });
                if (typeof onAction == 'function') onAction('signature', newFile);
                await generateVisorPDF(file, blob);
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: 'No se pudo firmar el PDF' })
            });
    }

    // mostrar observación
    const showObservation = async () => Swal.fire({ icon: 'info', text: is_observation });

    // render
    return (
        <div className={cn(
            "tw-relative tw-group tw-inline-flex tw-flex-col tw-items-center tw-gap-1",
            edit && "tw-mb-2"
        )}>
            {/* Contenedor del archivo con iconos de acción */}
            <div className="tw-relative tw-flex tw-items-center tw-gap-2">
                {/* Iconos de acción a la izquierda */}
                <Show condicion={edit}>
                    <div className="tw-flex tw-flex-col tw-gap-1 tw-mr-1">
                        <Show condicion={!meta_info?.hidden?.includes('signature') && !hidden.includes('signature')}>
                            <button
                                type="button"
                                title="Firmar Archivo"
                                onClick={handleSignaturePDF}
                                className="tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-emerald-50 tw-text-emerald-600 hover:tw-bg-emerald-100 tw-transition-colors tw-border-0 tw-cursor-pointer"
                            >
                                <i className="fas fa-signature tw-text-xs"></i>
                            </button>
                        </Show>

                        <Show condicion={!meta_info?.hidden?.includes('delete') && !hidden?.includes('delete')}>
                            <button
                                type="button"
                                title="Eliminar Archivo"
                                onClick={deleteFile}
                                className="tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-100 tw-transition-colors tw-border-0 tw-cursor-pointer"
                            >
                                <i className="fas fa-times tw-text-xs"></i>
                            </button>
                        </Show>
                    </div>
                </Show>

                {/* Archivo principal */}
                <a
                    href={url || ""}
                    target="_blank"
                    className={cn(
                        "tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-no-underline tw-transition-all tw-duration-200",
                        meta_info.bg,
                        "hover:tw-shadow-md hover:tw-scale-[1.02]",
                        is_observation && "tw-ring-2 tw-ring-amber-400"
                    )}
                    title={name || ""}
                    onClick={(e) => typeof onClick == 'function' ? onClick(e) : null}
                >
                    <i className={cn(meta_info.icon, meta_info.color, "tw-text-lg")}></i>
                    <span className="tw-text-xs tw-font-medium tw-text-gray-700 tw-max-w-[120px] tw-truncate">
                        {name || ""}
                    </span>
                </a>

                {/* Indicador de observación */}
                <Show condicion={is_observation}>
                    <button
                        type="button"
                        title="Observación de archivo"
                        onClick={showObservation}
                        className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-amber-100 tw-text-amber-600 hover:tw-bg-amber-200 tw-transition-colors tw-border-0 tw-cursor-pointer tw-ml-1"
                    >
                        <i className="fas fa-info-circle tw-text-[10px]"></i>
                    </button>
                </Show>
            </div>

            <Show condicion={show_signed}>
                <PdfView
                    pdfUrl={pdf_url}
                    pdfDoc={pdf_doc}
                    pdfBlob={pdf_blob}
                    onSigned={signaturePDF}
                    onClose={(e) => setShowSigned(false)}
                />
            </Show>
        </div>
    )
}


// exportar
export default ItemFileCircle;