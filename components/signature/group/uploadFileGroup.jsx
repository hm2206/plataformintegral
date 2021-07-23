import React, { useContext, useEffect, useState } from 'react';
import { DropZone } from '../../Utils';
import ProgressFile from '../../progressFile';
import Show from '../../show';
import { formatBytes } from '../../../services/utils';
import { signature, CancelRequest, onProgress } from '../../../services/apis'
import { groupTypes } from '../../../contexts/signature/GroupReducer';
import { GroupContext } from '../../../contexts/signature/GroupContext';
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
const Upload = ({ file, onClose = null, onUploaded = null }) => {

    // group
    const { group, dispatch } = useContext(GroupContext);

    // estados
    const [percent, setPercent] = useState(0);
    const [current_cancel, setCurrentCancel] = useState(false);

    // cancelar request
    const cancelTokenRequest = () => current_cancel && current_cancel.cancel();

    // subir archivo
    const uploadFile = async () => {
        // data
        let payload = new FormData;
        payload.append('object_id', group.id);
        payload.append('object_type', 'App/Models/Group');
        payload.append('object_dir', group.slug);
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
        .then(res => {
            setTimeout(() => {
                let newFiles = res.data.files;
                dispatch({ type: groupTypes.UPLOAD_READY, payload: file });
                dispatch({ type: groupTypes.DOWNLOAD_PUSH, payload: newFiles });
                dispatch({ type: groupTypes.UPLOAD_NEXT, payload: {} });
                if (typeof onUploaded == 'function') onUploaded();
            }, 700);
            // response
            return true;
        }).catch(err => (false));
        // response
        return response;
    }

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

// component main
const UploadFileGroup = () => {

    // group
    const { dispatch, upload, files } = useContext(GroupContext);

    useEffect(() => {
        dispatch({ type: groupTypes.SET_UPLOAD, payload: [] });
        dispatch({ type: groupTypes.SET_FILE, payload: [] });
    }, []);

    // render
    return (
        <div>
            <DropZone
                id={`file-upload-signer`}
                name="files"
                multiple
                accept="application/pdf"
                title="Seleccionar PDF"
                onRaw={(target) => dispatch({ type: groupTypes.FILE_ADD, payload: target })}
            />
            <div className="mt-3">
                <div className="row">
                    {/* archivos en proceso de subida */}
                    <Show condicion={upload?.length}>
                        <div className="col-12">
                            <hr/>
                                <i className="fas fa-upload"></i> Subiendo archivos
                            <hr/>
                        </div>
                        {/* lista de archivo en subida */}
                        {upload?.map((f, indexF) => 
                            <Fragment key={`list-upload-${indexF}`}>
                                <Upload file={f} 
                                    onClose={(e) => dispatch({ type: groupTypes.UPLOAD_DELETE, payload: indexF })}
                                />
                            </Fragment>
                        )}
                    </Show>
                    {/* archivos cargados */}
                    {files?.map((f, indexF) => 
                        <div className="col-md-4 col-12 col-sm-6 mb-2"
                            key={`list-file-${indexF}`}
                        >
                            <FileInfo file={f}
                                onDelete={(e) => dispatch({ type: groupTypes.FILE_DELETE, payload: indexF })}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UploadFileGroup;