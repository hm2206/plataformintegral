import React, { useState } from 'react';
import moment from 'moment';
import { formatBytes } from '../services/utils';

const icons = {
    text: { icon: 'far fa-file-alt', className: 'text-dark' },
    word: {  icon: 'far fa-file-word', className: 'text-primary' },
    pdf: { icon: 'far fa-file-pdf', className: 'text-danger' },
    img: { icon: 'far fa-file-image', className: 'text-success' },
    audio: { icon: 'far fa-file-audio', className: 'text-info' },
    video: { icon: 'far fa-file-video', className: 'text-purple' },
}

const extensions = {
    docx: icons.word,
    doc: icons.word,
    txt: icons.text,
    pdf: icons.pdf,
    jpg: icons.img,
    jpeg: icons.img,
    png: icons.img,
    mp3: icons.audio,
    mp4: icons.video,
};

const FileSimple = ({ name = "archivo.tmp", size = 0, extname = "tmp", date = '2021-02-04 11:20:01' }) => {

    const extension = extensions[extname] || {}

    // render
    return (
        <div className="card card-body">
            <div href="#" className={`filemgr-thumb ${extension.className || 'text-dark'}`}>
                <i className={extension.icon || 'far fa-file'}></i>
            </div>
            <a href="#" 
                className="stretched-link card-title card-link text-body font-size-sm d-block font-13 text-ellipsis"
                title={name}
            >
                {name || ""}
            </a>
            <small class="text-muted">{formatBytes(size)}</small>
            <div class="card-footer border-top-0 small text-muted">{moment(date, "YYYY/MM/DD HH:mm:ss").lang('es').fromNow()}</div>
        </div>
    )
}

// exportar
export default FileSimple;