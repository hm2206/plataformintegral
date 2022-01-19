import React,  { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { tramite, onProgress } from '../services/apis';
import Show from './show';
import Swal from 'sweetalert2';
import { Button } from 'semantic-ui-react';
import { AuthContext } from '../contexts/AuthContext'

const options = {
    IFRAME: 'IFRAME',
    IMAGE: 'IMAGE', 
}

const actions = {
    pdf: options.IFRAME,
    jpg: options.IMAGE,
    png: options.IMAGE,
};

const canPrint = [options.IFRAME];


const Visualizador = ({ 
    id = 'iframe-visuzalizador', name, extname, url, observation, 
    onDownload = null, 
    onClose = null, 
    onUpdate = null, 
    is_observation = true, is_print = false,
}) => {

    // auth
    const auth_context = useContext(AuthContext)

    // estados
    const [current_url, setCurrentUrl] = useState("");
    const [current_file, setCurrentFile] = useState({});
    const [is_error, setIsError] = useState(false);
    const [is_download, setIsDownload] = useState(false);
    const [is_note, setIsNote] = useState(observation ? true : false);
    const [current_observation, setCurrentObservation] = useState(observation);
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_percent, setCurrentPercent] = useState(0);

    const currentAction = useMemo(() => {
        return actions[extname] || "";
    }, [extname])

    const options = {
        responseType: 'blob',
        onDownloadProgress: (evt) => onProgress(evt, setCurrentPercent),
        headers: {
            ClientId: process?.env?.NEXT_PUBLIC_CLIENT_ID,
            ClientSecret: process?.env?.NEXT_PUBLIC_CLIENT_SECRET,
            Authorization: `Bearer ${auth_context?.token}`
        }
    }

    // obtener archivo
    const getFile = async () => {
        setCurrentLoading(true);
        await axios.get(url, options)
        .then(async res => {
            let type = res.headers['content-type'];
            let blob = new Blob([res.data], { type });
            let new_url = await URL.createObjectURL(blob);
            let file = new File([blob], name);
            setCurrentFile(file);
            setCurrentUrl(`${new_url}#toolbar=0`);
            setIsError(false);
            setIsDownload(true);
        }).catch(err => {
            setIsError(true);
            setIsDownload(false);
        })
        // obtener datos
        setTimeout(() => {
            setCurrentPercent(0);
            setCurrentLoading(false);
        }, 1000);
    }

    // descargar archivo
    const downloadFile = async () => {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(current_file);
        a.target = '_blank';
        a.download = name;
        a.click();
        if (typeof onDownload == 'function') onDownload();
    }

    // imprimir archivo
    const printFile = async () => {
        let iframe = document.getElementById(id);
        iframe.focus();
        iframe.contentWindow.print();
    }

    // configurar datos
    const getConfig = async () => {
        let body = document.body;
        body.style = 'overflow: hidden';
        await getFile();
    }

    // añadir observación
    const updateObservation = async () => {
        setCurrentLoading(true);
        await tramite.post(`file/${id}/observation`, { observation: current_observation })
            .then(res => {
                let { success, message, file } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                if (typeof onUpdate == 'function') onUpdate(file);
            }).catch(err => Swal.fire({ icon: 'error', text: 'No se pudó guardar la observación' }))
        setCurrentLoading(false)
    }

    // montar componente
    useEffect(() => {
        getConfig();
        // desmotar
        return () => {
            let body = document.body;
            body.style = 'overflow: block';
        }
    }, [])

    // render
    return (
        <div className="window-visualizador">
            <div className="visualizador-header">
                <div className="row align-items-center">
                    <div className="col-md-9 col-7">
                        <a href="#" className="text-white cursor-pointer font-17 mr-4"
                            onClick={(e) => {
                                e.preventDefault();
                                if (typeof onClose == 'function') onClose(e);
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </a>
                        <i className={`fas fa-file-${extname} mr-3`}></i>
                        <span><b>{name || ""}</b></span>
                    </div>
                    <div className="col-md-3 col-5 text-right">
                        <Show condicion={is_observation}>
                            <button className="btn text-white font-15 mr-2"
                                disabled={!is_download}
                                onClick={(e) => setIsNote(true)}
                            >
                                <i className="fas fa-sticky-note mr-1"></i>
                                Observación
                            </button>
                        </Show>

                        <button className="btn text-white font-15"
                            disabled={!is_download}
                            onClick={downloadFile}
                            title="Descargar"
                        >
                            <i className="fas fa-download"></i>
                        </button>

                        <Show condicion={canPrint.includes(currentAction) && is_print}>
                            <button className="btn text-white font-15"
                                disabled={!is_download}
                                onClick={printFile}
                                title="Imprimir"
                            >
                                <i className="fas fa-print"></i>
                            </button>
                        </Show>
                    </div>
                </div>

                <Show condicion={current_loading}>
                    <div style={{ height: '9px', background: '#cfd8dc', width: `${current_percent}%`, position: 'absolute', left: "0px", bottom: "-9px" }}></div>
                </Show>
            </div>
            <div className="h-100">
                <Show condicion={currentAction == 'IFRAME'}>
                    <iframe src={current_url} width="100%" height="92%" style={{ border: "0px", objectFit: 'contain' }} id={id}/>
                </Show>
                <Show condicion={currentAction == 'IMAGE'}>
                    <div className="row justify-content-center h-100">
                        <img src={current_url} alt={name} style={{ objectFit: 'contain', maxHeight: "100%" }}/>
                    </div>
                </Show>
                <Show condicion={is_download && !currentAction}>
                    <div className="text-center h-100 row justify-content-center align-items-center">
                        <div className="col-12">
                            <span onClick={downloadFile} className="btn btn-outline-light cursor-pointer">
                                Descargar archivo <i className="fas fa-download"></i>
                            </span>
                        </div>
                    </div>
                </Show>                
                {/* nota */}
                <Show condicion={is_note}>
                    <div className="content-note">
                        <div className="card h-100 w-100">
                            <div className="card-header">
                                Observación
                                <span className="close cursor-pointer"
                                    onClick={(e) => setIsNote(false)}
                                >
                                    <i className="fas fa-times"></i>
                                </span>
                            </div>
                            <div className="card-body" style={{ overflowY: 'auto' }}>
                                <textarea className="form-control" rows="5"
                                    value={current_observation || ""}
                                    onChange={({ target }) => setCurrentObservation(target.value || "")}
                                />
                                <div className="text-right mt-3">
                                    <Button color="teal"
                                        disabled={current_loading}
                                        onClick={updateObservation}
                                        loading={current_loading}
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
            </div>
        </div>
    )
}

// exportar
export default Visualizador;