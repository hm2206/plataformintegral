import React, { Fragment, useContext, useEffect, useState } from 'react';
import { signature } from '../../services/apis';
import { formatBytes } from '../../services/utils';
import Skeleton from 'react-loading-skeleton';
import Visualizador from '../visualizador';
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';

const SignedAllPage = ({ notification, config = {} }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_render, setIsRender] = useState(false);
    const [is_error, setIsError] = useState(false);
    const [file, setFile] = useState({});
    const [is_download, setIsDownload] = useState(0);

    const getFile = async () => {
        setCurrentLoading(true);
        await signature.get(`notification/file/${notification.object_id}`, config)
        .then(res => {
            let { file } = res.data;
            setFile(file);
            setIsDownload(file.state);
            setIsError(false);
        }).catch(err => {
            setIsError(true);
        });
        setCurrentLoading(false);
    }

    const disableFile = async () => {
        if (!is_download) return;
        app_context.setCurrentLoading(true);
        await signature.post(`notification/file/${notification.object_id}/disabled?_method=PUT`, {}, config)
        .then(res => {
            app_context.setCurrentLoading(false);
            setIsDownload(false);
            setIsError(false);
        }).catch(err => {
            app_context.setCurrentLoading(false);
            setIsError(true)
        });
    }

    useEffect(() => {
        getFile();
    }, []);

    // render
    return (
        <Fragment>
            <div className="card-header">
                <i className="fas fa-file-pdf text-danger"></i> Archivo firmado: {file?.name || ""}
            </div>

            <div className="card-body">
                <Show condicion={!current_loading}
                    predeterminado={
                        <ul>
                            <li><Skeleton width="200px"/></li>
                            <li><Skeleton width="200px"/></li>
                            <li><Skeleton width="200px"/></li>
                            <li><Skeleton width="200px"/></li>
                        </ul>
                    }
                >
                    <ul>
                        <li>Nombre: <b>{file?.name || ""}</b></li>
                        <li>Tamaño: <b>{formatBytes(file?.size || 0)}</b></li>
                        <li>Fecha de creación: <b className="badge badge-light">{file?.created_at || ""}</b></li>
                        <li>Tipo de archivo: <b className="badge badge-dark">{file?.extname || ""}</b></li>
                        <Show condicion={is_download}>
                            <li>Archivo: <span className="text-primary cursor-pointer" onClick={() => setIsRender(true)}>Ver archivo</span></li>
                        </Show>
                    </ul>

                    <Show condicion={is_render}>
                        <Visualizador
                            name={file?.name}
                            extname={file?.extname}
                            url={file?.url}
                            is_observation={false}
                            onClose={() => setIsRender(false)}
                        />
                    </Show>
                </Show>
            </div>
        </Fragment>
    )
}

export default SignedAllPage;