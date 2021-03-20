import React, { useContext, useEffect, useReducer, useState } from 'react';
import { DropZone } from '../Utils';
import ProgressFile from '../progressFile';
import Show from '../show';
import { formatBytes } from '../../services/utils';
import { signature, CancelRequest, onProgress } from '../../services/apis'
import { GroupContext } from '../../contexts/SignatureContext';
import { collect } from 'collect.js';
import { Fragment } from 'react';

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
const Upload = ({ file, onClose = null, onUploaded }) => {

    // group
    const group_context = useContext(GroupContext);

    // estados
    const [percent, setPercent] = useState(0);
    const [current_cancel, setCurrentCancel] = useState(false);
    const [is_upload, setIsUpload] = useState(false);

    // cancelar request
    const cancelTokenRequest = () => current_cancel && current_cancel.cancel();

    // subir archivo
    const uploadFile = async () => {
        // data
        let payload = new FormData;
        payload.append('object_id', group_context.group.id);
        payload.append('object_type', 'App/Models/Group');
        payload.append('files', file);
        // cancel token
        let cancel_token = CancelRequest();
        setCurrentCancel(cancel_token);
        // config
        let options = {
            onUploadProgress: (evt) => onProgress(evt, setPercent),
            cancelToken: cancel_token.token
        };
        // send request
        let response = await signature.post('file', payload, options)
        .then(res => (true))
        .catch(err => (false));
        // lista
        if (response && typeof onUploaded == 'function') {
            setIsUpload(true);
            onUploaded(file);
        }
        // response
        return response;
    }

    if (is_upload) return null;

    // render
    return (
        <div className="col-md-4 col-12 col-sm-6 mb-2">
            <ProgressFile 
                file={file}
                size={file.size}
                onUpload={uploadFile}
                onCancel={cancelTokenRequest}
                onClose={onClose}
                percent={percent}
                stepDefault="CANCEL"
            />
        </div>
    )
}

// tipo de action
const types = {
    FILE_ADD: "FILE[ADD]",
    FILE_DELETE: "FILE[DELETE]",
    UPLOAD_DELETE: "UPLOAD[DELETE]",
    UPLOAD_READY: "UPLOAD[READY]",
};

// estado inicial
const initialState = {
    files: [], // archivos sin subir
    upload: [], // archivos a subir
    ready: false // flag para saber cuando el proceso está listo
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
            let upload_count = collect(newState.upload).where('uploaded', false).toArray().length;
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
            newState.ready = false;
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
        case types.UPLOAD_READY:
            // flag uploaded
            let file_uploaded = newState.upload[action.payload];
            file_uploaded.uploaded = true;
            newState.upload[action.payload] = file_uploaded;
            let file_new = newState.files[0] || null;
            if (file_new) {
                newState.files.shift();
                newState.upload.unshift(file_new);
                let count_files = newState.files.length;
                let count_upload = collect(newState.upload).where('uploaded', false).toArray().length;
                newState.ready = count_files == 0 && count_upload == 0 ? true : false;
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
                    {/* archivos en proceso de subida */}
                    <Show condicion={fileState.upload.length}>
                        <div className="col-12">
                            <hr/>
                                <i className="fas fa-upload"></i> Subiendo archivos
                            <hr/>
                        </div>
                        <Show condicion={fileState.ready}>
                            <div className="text-right col-12">
                                <button className="btn btn-sm btn-danger">
                                    <i className="fas fa-times"></i> Limpiar archivos
                                </button>
                            </div>
                        </Show>
                        {/* lista de archivo en subida */}
                        {fileState.upload.map((f, indexF) => 
                            <Fragment key={`list-upload-${indexF}`}>
                                <Upload file={f} 
                                    onUploaded={(e) => dispatch({ type: types.UPLOAD_READY, payload: indexF })}
                                    onClose={(e) => dispatch({ type: types.UPLOAD_DELETE, payload: indexF })}
                                />
                            </Fragment>
                        )}
                    </Show>
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
                </div>
            </div>
        </div>
    )
}

export default UploadFileGroup;