import React, { useState, useEffect } from 'react';
import { Loader } from 'semantic-ui-react';
import Show from './show';

// estados
const next_status = {
    INITIAL: 'INITIAL',
    CANCEL: 'CANCEL',
    RELOAD: 'RELOAD',
    ERROR: 'ERROR'
};

const ProgressFile = ({ file = {}, size = 100, message = "", percent = 0, onClose = null, onUpload = null }) => {

    // estados
    const [is_paso, setIsPaso] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(message);
    const [is_upload, setIsUpload] = useState(false);
    const [is_success, setIsSuccess] = useState(false);
    const [is_error, setIsError] = useState(false);
    const [is_render, setIsRender] = useState(true);
    const [is_timer, setIsTimer] = useState(null);
    const is_file = Object.keys(file).length;

    // mostrar formateado los campos de bytes
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // validar size
    const validateSize = () => {
        let current_size = (file.size / (1024 * 1024)).toFixed(2);
        if (current_size > size) {
            setIsError(true);
            setTitle("Archivo grande");
            setDescription(`límite ${size}MB`);
            setIsPaso(next_status.ERROR);
        }
    }

    // generar información
    const generateInformation = () => {
        switch (is_paso) {
            case next_status.INITIAL:
                setTitle("Cancelado");
                setDescription("volver a intentar");
                setIsUpload(false);
                setIsSuccess(false);
                setIsError(false);
                break;
            case next_status.CANCEL:
                setIsSuccess(false);
                setIsError(false);
                setTitle("Subiendo");
                setDescription("cancelar");
                let timePaso = setTimeout(() => {
                    emitterUpload();
                }, 2000);
                setIsTimer(timePaso);
                break;
            case next_status.RELOAD:
                setTitle("Subido");
                setDescription("empezar");
                setIsUpload(false);
                break;
            case next_status.ERROR:
                break;
            default:
                setTitle("");
                setDescription("");
                setIsUpload(false);
                setIsSuccess(false);
                setIsError(false);
                break;
        }
    }

    // emitier evento de subida
    const emitterUpload = async () => {
        if (typeof onUpload == 'function') {
            setIsUpload(true);
            let response = await onUpload();
            setIsPaso(response ? next_status.RELOAD : next_status.INITIAL);
            setIsSuccess(response ? true : false);
            setIsError(!response ? true : false);
            setIsUpload(false);
        }
    }

    // mostrar información
    useEffect(() => {
        generateInformation();
    }, [is_paso]);

    // ejecutar error
    useEffect(() => {
        if (is_error) message ? setTitle("Ocurrio un error") : null;
    }, [is_error]);

    // validar tamaño
    useEffect(() => {
        validateSize();
        console.log('file');
    }, [is_file]);

    // render
    return (
        <div className={`upload-root ${is_success ? 'upload-complete' : ''} ${is_error ? 'upload-error' : ''}`}>
            <Show condicion={is_paso == next_status.INITIAL || is_paso == "" || is_paso == next_status.ERROR}>
                <div className={`upload-btn-content`}>
                    <button className={`upload-btn ${is_paso == next_status.INITIAL || is_paso == "" ? 'upload-btn-enabled' : 'upload-btn-none'}`}
                        onClick={(e) => {
                            if (typeof onClose == 'function') onClose();
                            setIsPaso("");
                            setIsSuccess(false);
                            setIsError(false);
                            setIsUpload(false);
                        }}
                    >
                        <i className="fas fa-times"></i>
                    </button>

                    <button className={`upload-btn ${is_paso == next_status.ERROR ? 'upload-btn-enabled' : 'upload-btn-none'}`}
                        onClick={(e) => {
                            if (typeof onClose == 'function') onClose();
                        }}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div> 
            </Show>

            <div className="upload-body">
                <div className="upload-body-text">
                    <b>{file.name || ""}</b>
                    <div className="py-0 font-10" style={{ opacity: 0.8 }}>{formatBytes(file.size || 0)}</div>
                </div>
                <div className="upload-body-text text-right ml-1">
                    <b>{title} {is_upload ? `${percent}%` : ''}</b>
                    <div className="py-0 font-10" style={{ opacity: 0.8 }}>{is_error && message ? message : description}</div>
                </div>
            </div>

            <Show condicion={next_status.ERROR != is_paso}>
                <div className="upload-btn-content text-right">
                    <button className={`upload-btn ${is_paso == next_status.INITIAL || is_paso == "" ? 'upload-btn-enabled' : 'upload-btn-none'}`}
                        onClick={(e) => setIsPaso(next_status.CANCEL)}
                    >
                        <i className="fas fa-upload"></i>
                    </button>

                    <button className={`upload-btn ${is_paso == next_status.CANCEL ? 'upload-btn-enabled' : 'upload-btn-none'}`}
                        onClick={(e) => {
                            clearTimeout(is_timer);
                            setIsPaso(next_status.INITIAL);
                        }}
                    >
                        <Loader size='mini' active inverted indeterminate={is_upload}/>
                    </button>

                    <button className={`upload-btn ${is_paso == next_status.RELOAD ? 'upload-btn-enabled' : 'upload-btn-none'}`}
                        onClick={(e) => setIsPaso("")}
                    >
                        <i className="fas fa-undo-alt"></i>
                    </button>
                </div>
            </Show>
        </div>
    )
}

// exportar
export default ProgressFile;