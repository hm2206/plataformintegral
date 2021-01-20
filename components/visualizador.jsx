import React,  { useEffect, useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import axios from 'axios';
import { tramite } from '../services/apis';
import Show from './show';
import Swal from 'sweetalert2';
import { Button } from 'semantic-ui-react';


const Visualizador = ({ id, name, extname, url, observation, onClick = null, onClose = null, onUpdate = null }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_url, setCurrentUrl] = useState("");
    const [current_file, setCurrentFile] = useState({});
    const [is_error, setIsError] = useState(false);
    const [is_download, setIsDownload] = useState(false);
    const [is_note, setIsNote] = useState(observation ? true : false);
    const [current_observation, setCurrentObservation] = useState(observation);
    const [current_loading, setCurrentLoading] = useState(false);

    // obtener archivo
    const getFile = async () => {
        app_context.fireLoading(true);
        await axios.get(url, { responseType: 'blob' })
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
        app_context.fireLoading(false);
    }

    // descargar archivo
    const downloadFile = async () => {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(current_file);
        a.target = '_blank';
        a.download = name;
        a.click();
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
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                if (typeof onUpdate == 'function') onUpdate(id);
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
        <div class="window-visualizador">
            <div class="visualizador-header">
                <div class="row align-items-center">
                    <div class="col-md-9 col-7">
                        <a href="#" class="text-white cursor-pointer font-17 mr-4"
                            onClick={(e) => {
                                e.preventDefault();
                                if (typeof onClose == 'function') onClose(e);
                            }}
                        >
                            <i class="fas fa-arrow-left"></i>
                        </a>
                        <i className={`fas fa-file-${extname} mr-3`}></i>
                        <span><b>{name || ""}</b></span>
                    </div>
                    <div class="col-md-3 col-5 text-right">
                        <button class="btn text-white font-15 mr-2"
                            disabled={!is_download}
                            onClick={(e) => setIsNote(true)}
                        >
                            <i class="fas fa-sticky-note"></i>
                        </button>

                        <button class="btn text-white font-15"
                            disabled={!is_download}
                            onClick={downloadFile}
                        >
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="h-100">
                <iframe src={current_url} width="100%" height="92%" style={{ border: "0px"}}/>
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