import React, { useState, useEffect } from 'react';
import { Loader } from 'semantic-ui-react';
import Show from './show';
import { formatBytes } from '../services/utils'

// estados
const next_status = {
    INITIAL: 'INITIAL',
    CANCEL: 'CANCEL',
    RELOAD: 'RELOAD',
    ERROR: 'ERROR'
};

const ProgressFile = ({ 
    file = {}, size = 100, message = "", percent = 0, download = false,
    onClose = null, onUpload = null, onCancel = null ,
    stepDefault = 'INITIAL'
}) => {

    // estados
    const [is_paso, setIsPaso] = useState("INITIAL");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(message);
    const [is_upload, setIsUpload] = useState(false);
    const [is_success, setIsSuccess] = useState(false);
    const [is_error, setIsError] = useState(false);
    const [is_render, setIsRender] = useState(true);
    const [is_timer, setIsTimer] = useState(null);
    const is_file = Object.keys(file).length;

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
                setTitle("Completado");
                setDescription("subir");
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

    // estado default
    useEffect(() => {
        setIsPaso(stepDefault)
    }, [file])

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
    }, [is_file]);

    // validar download
    useEffect(() => {
        if (download) setTitle("Bajando")
    }, [download]);

    // render
    return (
        <div className={`upload-root ${is_success ? 'upload-complete' : ''} ${is_error ? 'upload-error' : ''}`}>
            <div className="col-xs w-100">
                <Show condicion={is_paso == next_status.INITIAL || is_paso == "" || is_paso == next_status.ERROR}>
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
                </Show>
            </div>

            <div className={next_status.ERROR == is_paso ? 'col-md-10 col-xl-11 col-10' : 'col-md-9 col-xl-9 col-9'}>
                <div className="row w-100">
                    <div className="col-md-5 col-5">
                        <div className="upload-body-text">
                            <b title={file.name}>{file.name || ""}</b>
                            <div className="py-0 font-10" style={{ opacity: 0.8 }}>{formatBytes(file.size || 0)}</div>
                        </div>
                    </div>

                    <div className="col-md-7 col-7">
                        <div className="upload-body-text text-right ml-1">
                            <b>{title} {is_upload ? `${percent}%` : ''}</b>
                            <div className="py-0 font-10" style={{ opacity: 0.8 }}>{is_error && message ? message : description}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xs w-100">
                <Show condicion={next_status.ERROR != is_paso}>
                    <div className="text-right">
                        <button className={`upload-btn ${is_paso == next_status.INITIAL || is_paso == "" ? 'upload-btn-enabled' : 'upload-btn-none'}`}
                            onClick={(e) => setIsPaso(next_status.CANCEL)}
                        >
                            <i className="fas fa-upload"></i>
                        </button>

                        <button className={`upload-btn ${percent != 100 && is_paso == next_status.CANCEL ? 'upload-btn-enabled' : 'upload-btn-none'}`}
                            onClick={(e) => {
                                clearTimeout(is_timer);
                                setIsPaso(next_status.INITIAL);
                                if (typeof onCancel == 'function') onCancel();
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
        </div>
    )
}

// exportar
export default ProgressFile;