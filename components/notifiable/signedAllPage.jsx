import React, { Fragment, useEffect, useState } from 'react';
import { signature } from '../../services/apis';
import { formatBytes } from '../../services/utils';

const SignedAllPage = ({ notification, config = {} }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);
    const [file, setFile] = useState({});

    const getFile = async () => {
        setCurrentLoading(true);
        await signature.get(`notification/file/${notification.object_id}`, config)
        .then(res => {
            let { file } = res.data;
            setFile(file);
            setIsError(false);
        }).catch(err => {
            setIsError(true);
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        getFile();
    }, []);

    // render
    return (
        <Fragment>
            <div className="card-header">
                <i className="fas fa-file-pdf text-danger"></i> Archivo firmado: {file?.name}
            </div>

            <div className="card-body">
                <ul>
                    <li>Nombre: <b>{file?.name}</b></li>
                    <li>Tamaño: <b>{formatBytes(file?.size)}</b></li>
                    <li>Fecha de creación: <b className="badge badge-light">{file?.created_at}</b></li>
                    <li>Tipo de archivo: <b className="badge badge-dark">{file?.extname}</b></li>
                    <li>Archivo: <a target="__blank" href={file?.url}>Descargar</a></li>
                </ul>
            </div>
        </Fragment>
    )
}

export default SignedAllPage;