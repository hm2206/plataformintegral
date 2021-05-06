import React, { useState, useEffect, Fragment, useContext } from 'react';
import { Form, Checkbox } from 'semantic-ui-react';
import Show from './show';
import { Confirm } from '../services/utils';
import ListPfx from './listPfx';
import { signature, CancelRequest } from '../services/apis';
import Swal from 'sweetalert2';
import ProgressFile from './progressFile';
import { getPositions } from 'node-signature/client';
import axios from 'axios';
import { onProgress } from '../services/apis';
import { AuthContext } from '../contexts/AuthContext';
import pdfjsLib from 'pdfjs-dist';

const PdfView = ({ 
    pdfUrl = "", 
    pdfBlob,
    pdfDoc,
    disabledMetaInfo = false,
    metaInfo = { reason: "Yo soy el firmante", location: "PE", image: "" },
    onClose = null,
    onSigned = null
}) => {

    // auth
    const { auth } = useContext(AuthContext);

    // obtener metadatos del pdf
    let pdfPages = pdfDoc.getPages(); 
    let lastPage = pdfPages.length;

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_progress, setCurrentProgress] = useState(0);
    const [reason, setReason] = useState(metaInfo.reason || "");
    const [location, setLocation] = useState(metaInfo.location || "");
    const [current_signature, setCurrentSignature] = useState(false);
    const [page, setPage] = useState(1);
    const [all_page, setAllPage] = useState(false);
    const [current_position, setCurrentPosition] = useState("");
    const [count_signature, setCountSignature] = useState(0);
    const [positions, setPositions] = useState([]);
    const [current_select, setCurrentSelect] = useState({});
    const [errors, setErrors] = useState({});
    const [current_cancel, setCurrentCancel] = useState(null);
    const [current_download, setCurrentDownload] = useState(false);
    const [current_dimension, setCurrentDimension] = useState({});
    const isSelect = Object.keys(current_select).length;
    const isDimension = Object.keys(current_dimension).length;

    // config page
    let [current_col, setCurrentCol] = useState(0);
    
    // generar posiciones
    const generatePositions = async () => {
        let current_page = pdfPages[page - 1 || 0] || {};
        if (Object.keys(current_page).length) {
            let { width, height } = current_page.getSize();
            let datos = await getPositions({ width, height });
            setPositions(datos.positions);
            setCurrentPosition(0);
            setCurrentCol(datos.column);
            setCurrentDimension({ width, height });
        }
    }

    const handleInput = ({ name, value }, callback) => {
        if (typeof callback == 'function') callback(value)
    }

    const renderPage = async () => {
        if (page <= 0) return false;
        // obtener pdf
        let link = await URL.createObjectURL(pdfBlob);
        let loadTaskPdf = pdfjsLib.getDocument(link);
        loadTaskPdf.promise.then(async tmpPdf => {
            let contentPdf = document.getElementById('content-render');
            let nextPage = parseInt(`${page}`);
            let tmpPage = await tmpPdf.getPage(nextPage);
            let scale = 1;
            let viewport = await tmpPage.getViewport(scale);

            if (viewport.width >= contentPdf.clientWidth) {
                viewport = await tmpPage.getViewport(0.6);
                console.log(viewport);
            }

            let current_height = viewport.height;
            let current_width = viewport.width;

            let canvas = document.getElementById('render-pdf-canvas');
            let context = canvas.getContext('2d');
            canvas.height = current_height;
            canvas.width = current_width;

            let renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await tmpPage.render(renderContext);
        });

    }

    const handleClose = async (e) => {
        if (!current_loading && typeof onClose == 'function') {
            let answer = await Confirm("warning", `¿Deseas cerrar el visualizador de PDF?`, 'Cerrar');
            if (answer) onClose(e);
        }
    }

    const handleCancel = async () => current_cancel && current_cancel.cancel("Subida cancelada");

    const signer = async () => {
        let response = false;
        let cancelToken = CancelRequest();
        setErrors({});
        let payload = {};
        // assign pdfBlob
        payload.pdfBlob = pdfBlob;
        payload.page = page;
        payload.visible = false;
        // validar datos
        if (!disabledMetaInfo) {
            payload.reason = reason;
            payload.location = location;
        }
        // firma visible
        if (current_signature) {
            payload.position = current_position;
            payload.visible = true;
        }
        // emitir evento
        setCurrentLoading(true);
        setCurrentCancel(cancelToken);
        let datos = new FormData;
        datos.append('reason', payload.reason);
        datos.append('location', payload.location);
        datos.append('page', all_page ? 1 : payload.page);
        datos.append('last_page', lastPage);
        datos.append('file', payload.pdfBlob);
        datos.append('visible', payload.visible);
        datos.append('certificate_id', current_select.id);
        datos.append('all_page', all_page);
        if (payload.position) datos.append('position', payload.position);
        await signature.post(`auth/signer`, datos, { 
            responseType: all_page ? 'json' : 'blob',
            onUploadProgress: (evt) => onProgress(evt, setCurrentProgress), 
            onDownloadProgress: (evt) => onProgress(evt, (p) => { 
                setCurrentDownload(true);
                setCurrentProgress(p);
            }),
            cancelToken: cancelToken.token,
            headers : { 'Content-Type': 'multipart/form-data' }
        }).then(async res => {
            let { data } = res;
            if (all_page) {
                Swal.fire({ icon: 'info', text: "El archivo está siendo procesado, será notificado cuando esté listo!" });
                if (typeof onClose == 'function') onClose();
                return true;
            }
            response = true;
            if (typeof onSigned == 'function') await onSigned(payload, data);
            else {
                let a = document.createElement('a');
                a.href = URL.createObjectURL(data);
                a.target = '__blank';
                a.download = payload.pdfBlob.name;
                await a.click();
                // cerrar díalogo
                setTimeout(() => {
                    if (typeof onClose == 'function') onClose();
                }, 2000);
            }
        }).catch(err => {
            try {
                response = false;
                if (axios.isCancel(err)) throw new Error(err.message);
                else {
                    let { data } = err.response;
                    if (typeof data != 'object') throw new Error(err.message);
                    if (typeof data.type != 'undefined') {
                        const blb = new Blob([data], {type: "text/plain"});
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                let resData = JSON.parse(reader.result) || {};
                                if (typeof resData != 'object') throw new Error(err.message);
                                if (typeof resData.errors != 'object') throw new Error(resData.message);
                                Swal.fire({ icon: 'warning', text: resData.message });
                                setErrors(resData.errors || {});
                            } catch (error) {
                                Swal.fire({ icon: 'error', text: error.message });  
                            }
                        }
                        // executar blob
                        reader.readAsText(blb);
                    } else {
                        if (typeof data.errors != 'object') throw new Error(data.message);
                        Swal.fire({ icon: 'warning', text: data.message });
                        setErrors(data.errors || {});
                    }
                }
            } catch (error) {
                Swal.fire({ icon: 'error', text: error.message });
            }
        });
        // quitar barra de progreso
        setTimeout(() => {
            setCurrentDownload(false);
            setCurrentLoading(false);
            setCurrentProgress(0);
        }, 1000);
        // response
        return response;
    }

    const getSignatures = async () => {
        let form = pdfDoc.getForm();
        let fields = form.getFields();
        let iter = 1;
        await fields.map(field => {
            let name = /Signature[0-9]+$/;
            if (name.test(field.getName())) setCountSignature(iter++);
        });
    }

    // generar calculos
    useEffect(() => {
        getSignatures();
        generatePositions();
    }, [page, pdfUrl]);

    // renderizar
    return (
        <div style={{
                position: 'fixed',
                width: '100%', 
                height: '100%', 
                top: '0px', 
                left: '0px',
                background: 'rgba(0,0,0,.5)',
                zIndex: '1050',
                padding: "1em 1.5em"
            }}
        >
            <div className="card w-100 h-100" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                <div className="card-header pl-4 text-left">
                    <i className="fas fa-file-pdf"></i> Visualizador de pdf
                    <i className="fas fa-times close" style={{ cursor: 'pointer' }} onClick={handleClose}></i>
                </div>
                <div className="row h-100 text-left">
                    <div className="col-md-8 col-lg-9">
                        <iframe className="w-100 h-100 pl-4" frameBorder="0" src={pdfUrl}/>
                        {/* <div className="text-center w-100 h-100" style={{ background: '#455a64', position: "relative" }} id="content-render">
                            <canvas id="render-pdf-canvas" className="mt-2" width="100%" height="100%"/>
                        </div> */}
                    </div>
                    <div className="col-md-4 col-lg-3">
                        <div className="h-100 w-100" style={{ borderLeft: '1px solid rgba(20,20,31,.12)' }}>
                            <div className="card-body">
                                <div className="row">
                                    <ListPfx
                                        disabled={current_loading}
                                        classBody="col-md-12"
                                        classSkeleton="col-md-12"
                                        person_id={auth.person_id || null}
                                        onClick={(e, obj) => setCurrentSelect(obj)}
                                    />
                                </div>
                                
                                <Show condicion={count_signature}>
                                    <div className="card">
                                        <div className="card-header">
                                        <i className="fas fa-signature"></i>  Se encontró {count_signature} firmas
                                        </div>
                                    </div>
                                </Show>

                                <div className="card">
                                    <div className="card-header">
                                        <i className="fas fa-cog"></i> Configurar PDF 
                                    </div>
                                    <div className="card-body">
                                        <Form>
                                            <Show condicion={!disabledMetaInfo}>
                                                <Form.Field>
                                                    <label htmlFor="">Motivo</label>
                                                    <input type="text"
                                                        name="reason"
                                                        value={reason}
                                                        disabled={current_loading}
                                                        onChange={({target}) => handleInput(target, setReason)}
                                                    />
                                                </Form.Field>

                                                <Form.Field>
                                                    <label htmlFor="">Locación</label>
                                                    <input type="text"
                                                        name="location"
                                                        value={location}
                                                        disabled={current_loading}
                                                        onChange={({target}) => handleInput(target, setLocation)}
                                                    />
                                                </Form.Field>

                                                <Form.Field>
                                                    <label htmlFor="">Dimensión</label>
                                                    <input type="text"
                                                        className="text-center"
                                                        value={`${current_dimension?.width || 0} x ${current_dimension?.height || 0}`}
                                                        readOnly
                                                    />
                                                </Form.Field>
                                            </Show>

                                            <Form.Field>
                                                <label htmlFor="">Todas las hojas</label>
                                                <div>
                                                    <Checkbox toggle 
                                                        disabled={current_loading}
                                                        checked={all_page}
                                                        name="all_page"
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked }, setAllPage)}
                                                    />
                                                </div>
                                            </Form.Field>

                                            {/* posición de firma en la página */}
                                            <Show condicion={!all_page}>
                                                <Form.Field>
                                                    <label htmlFor="">Página {page || 0} de {lastPage || 1}</label>
                                                    <input type="text"
                                                        value={page}
                                                        name="page"
                                                        disabled={current_loading}
                                                        onChange={({target}) => handleInput(target, (value) => { 
                                                            let isNumber = /^[0-9]+$/;
                                                            if (isNumber.test(value) && value <= lastPage) {
                                                                setPage(value);
                                                                setCurrentPosition({ x: 0, y: 0 });
                                                            } else if (value == "") {
                                                                setPage(value);
                                                            }
                                                        })}
                                                    />
                                                </Form.Field>
                                            </Show>
                                            
                                            <Form.Field>
                                                <label htmlFor="">Firma Visible</label>
                                                <div>
                                                    <Checkbox toggle 
                                                        disabled={current_loading}
                                                        checked={current_signature}
                                                        name="current_signature"
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked }, setCurrentSignature)}
                                                    />
                                                </div>
                                            </Form.Field>
                                        </Form>
                                    </div>
                                </div>

                                <Show condicion={current_signature}>
                                    <div className="card">
                                        <div className="card-header">
                                            <i className="fas fa-cog"></i> Configurar Posición
                                        </div>
                                        <div className="card-body">
                                            <Form>
                                                <Form.Field>
                                                    <div className="card- pt-4">
                                                        <div className="row justify-content-around">
                                                            {positions.map((pos, indexPos) => 
                                                                <Fragment key={`list-point-position-${indexPos}`}>
                                                                    <div className={`col-xs mb-3 text-center`}>
                                                                        <input type="radio"
                                                                            value={pos.value}
                                                                            disabled={current_loading}
                                                                            checked={pos.value == current_position ? true : false}
                                                                            onChange={({target}) => handleInput(target, setCurrentPosition)}
                                                                        />
                                                                    </div> 

                                                                    <Show condicion={current_col == (pos.column + 1)}>
                                                                        <div className="col-md-12"></div>
                                                                    </Show>
                                                                </Fragment>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Form.Field>
                                            </Form>
                                        </div>
                                    </div>
                                </Show>

                                <Show condicion={isSelect && page > 0}>
                                    <div className="mt-3">
                                        <ProgressFile 
                                            download={current_download}
                                            message={errors.file && errors.file[0] || ""}
                                            percent={current_progress}
                                            file={pdfBlob}
                                            onUpload={signer}
                                            onClose={handleClose}
                                            onCancel={handleCancel}
                                            size={25}
                                        />
                                    </div>
                                </Show>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PdfView;