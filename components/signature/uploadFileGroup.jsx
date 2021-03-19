import React, { useEffect, useReducer, useState } from 'react';
import { DropZone } from '../Utils';
import ProgressFile from '../progressFile';
import Show from '../show';
import { formatBytes } from '../../services/utils';

const FileInfo = ({ file, onDelete = null }) => (
    <div className="upload-root upload-theme-light">
        <button className="upload-btn" onClick={(e) => typeof onDelete == 'function' ? onDelete(e) : null}>
            <i className="fas fa-times"></i>
        </button>
        {/* info */}
        <span className="upload-body-text ml-2 text-dark">
            <b>{file.name || ""}</b>
            <div className="py-0 font-10">{formatBytes(file.size)}</div>
        </span>
    </div>
);

// subir archivo al server
const Upload = ({ file, onClose = null }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [percent, setPercent] = useState(0);

    // subir archivo
    const uploadFile = async () => {
        setCurrentLoading(true);

        setCurrentLoading(false);
    }

    // enviar archivo por defecto
    useEffect(() => {
        uploadFile();
    }, []);

    // render
    return <ProgressFile file={file} size={file.size}
        onClose={onClose}
    />
}

// tipo de action
const types = {
    FILE_ADD: "FILE[ADD]",
    FILE_DELETE: "FILE[DELETE]",
    UPLOAD_DELETE: "FILE[UPLOAD]",
};

// estado inicial
const initialState = {
    files: [], // archivos sin subir
    upload: [], // archivos a subir
};

// reducer del file
const FileReducer = (state, action = { type: "", payload: {} }) => {
    // clonar estado
    let newState = Object.assign({}, state);
    // seleccionar
    switch (action.type) {
        case types.FILE_ADD:
            let file_temp = action.payload.files;
            // validar upload
            let upload_count = newState.upload.length;
            // append datos
            if (upload_count < 5)  {
                let limit = 5 - upload_count;
                Object.values(file_temp).forEach((f, indexF) => {
                    if (indexF < limit) newState.upload.push(f);
                    else newState.files.push(f);
                });
            } else newState.files.push(...file_temp);
            // clear input
            action.payload.value = null;
            // response
            return newState;
        case types.FILE_DELETE:
            newState.files.splice(action.payload, 1);
            // response
            return newState;
        case types.UPLOAD_DELETE:
            newState.upload.splice(action.payload, 1);
            let upload_add = newState.files[0];
            if (upload_add) {
                newState.upload.push(upload_add);
                newState.files.shift();
            }
            // response
            return newState;
        default:
            return state;
    }
}

// component main
const UploadFileGroup = () => {

    // estado
    const [fileState, dispatch] = useReducer(FileReducer, initialState);

    // render
    return (
        <div>
            <DropZone
                id={`file-upload-signer`}
                name="files"
                multiple
                accept="application/pdf"
                title="Seleccionar PDF"
                onRaw={(target) => dispatch({ type: types.FILE_ADD, payload: target })}
            />
            <div className="mt-3">
                <div className="row">
                    {/* archivos cargados */}
                    {fileState.files.map((f, indexF) => 
                        <div className="col-md-4 col-12 col-sm-6 mb-2"
                            key={`list-file-${indexF}`}
                        >
                            <FileInfo file={f}
                                onDelete={(e) => dispatch({ type: types.FILE_DELETE, payload: indexF })}
                            />
                        </div>
                    )}
                    {/* archivos en proceso de subida */}
                    <Show condicion={fileState.upload.length}>
                        <div className="col-12">
                            <hr/>
                                <i className="fas fa-upload"></i> Subiendo archivos
                            <hr/>
                        </div>
                    </Show>
                    {fileState.upload.map((f, indexF) => 
                        <div className="col-md-4 col-12 col-sm-6 mb-2" 
                            key={`list-upload-${indexF}`}
                        >
                            <Upload file={f} 
                                onClose={(e) => dispatch({ type: types.UPLOAD_DELETE, payload: indexF })}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UploadFileGroup;