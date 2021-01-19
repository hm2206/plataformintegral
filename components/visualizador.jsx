import React,  { useEffect, useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import axios from 'axios';


const Visualizador = ({ name, extname, url, onClick = null, onClose = null }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_url, setCurrentUrl] = useState("");
    const [current_file, setCurrentFile] = useState({});
    const [is_error, setIsError] = useState(false);
    const [is_download, setIsDownload] = useState(false);

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
                        <i class="fas fa-file-pdf mr-3"></i>
                        <span><b>{name || ""}</b></span>
                    </div>
                    <div class="col-md-3 col-5 text-right">
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
            </div>
        </div>
    )
}

// exportar
export default Visualizador;