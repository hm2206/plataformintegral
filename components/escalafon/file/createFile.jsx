import React, { useMemo, useState } from "react";
import Show from "../../show";
import { DropZone } from '../../Utils'
import { formatBytes } from '../../../services/utils'
import ProgressFile from "../../progressFile";
import { onProgress, CancelRequest, escalafon } from '../../../services/apis'

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

const CreateFile = ({ objectType, objectId, multiple = true, onSave = null }) => {

    const [current_files, setCurrentFiles] = useState([]);
    const [upload_file, setUploadFile] = useState({})
    const [percent, setPercent] = useState(0)
    const [current_cancel, setCurrentCancel] = useState(false);

    const isUploadFile = useMemo(() => {
        return upload_file?.name ? true : false;
    }, [upload_file?.name]);

    const showDropZone = useMemo(() => {
        if (!multiple && isUploadFile) return false 
        return true
    }, [upload_file])

    const cancelTokenRequest = () => current_cancel && current_cancel.cancel();

    const handleFiles = ({ files }) => {
        let payload = [];
        let index = 0
        for (let item of files) {
            if (index == 0) setUploadFile(item)
            else payload.push(item)
            index++
        }
        setCurrentFiles(payload)
    }

    const handleClose = () => {
        let newUpload = current_files[0];
        if (!newUpload) {
            setUploadFile({})
            return false;
        }

        setUploadFile(newUpload);
        let newFiles = [...current_files]
        newFiles.splice(0, 1);
        setCurrentFiles(newFiles);
    }

    const handleUpload = async () => {
        // data
        setPercent(0)
        let payload = new FormData;
        payload.append('object_id', objectId);
        payload.append('object_type', objectType);
        payload.append('file', upload_file);
        // cancel token
        let cancel_token = CancelRequest();
        setCurrentCancel(cancel_token);
        // config
        let options = {
            onUploadProgress: (evt) => onProgress(evt, setPercent),
            cancelToken: cancel_token.token
        };
        // send request
        let response = await escalafon.post('files', payload, options)
        .then(({ data }) => {
            let newFile = data?.file;
            setTimeout(() => {
                setPercent(0)
                setUploadFile({})
                handleClose();
                if (typeof onSave == 'function') onSave(newFile);
            }, 400)
            // response
            return true;
        }).catch(err => (false));
        // response
        return response;
    }

    return (
        <>
            <Show condicion={showDropZone}>
                <DropZone
                    onChange={handleFiles}
                    id="upload-file"
                    name="file"
                    title="Subir archivo"
                    multiple={multiple}
                />
            </Show>
            {/* itemfile */}
            <Show condicion={isUploadFile}>
                <div className="mb-2">
                    <ProgressFile 
                        stepDefault="CANCEL"
                        file={upload_file}
                        size={upload_file?.size}
                        percent={percent}
                        onClose={handleClose}
                        onUpload={handleUpload}
                        onCancel={cancelTokenRequest}
                    />
                </div>
            </Show>
            {/* listado de archivos por subir */}
            {current_files?.map((f, indexF) => 
                <div className="mt-1 mb-2">
                    <FileInfo file={f}/>
                </div>
            )}
        </>
    )
}

export default CreateFile