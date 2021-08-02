import React, { useState } from 'react';
import moment from 'moment';
import { formatBytes } from '../services/utils';
import Show from './show';
import CardLoader from './cardLoader';
moment.locale('es');

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

const FileSimple = ({ name = "archivo.tmp", url = null, size = 0, extname = "tmp", date = '2021-02-04 11:20:01', onDelete = null, onClick = null, loading = false }) => {

    const extension = extensions[extname] || {}

    // generar link
    const handleLink = (e) => {
        e.preventDefault();
        if (typeof onClick == 'function') return onClick(e);
        if (!url) return false;
        let a = document.createElement('a');
        a.target = '_blank';
        a.href = url;
        a.click();
    }

    // render
    return (
        <div className="card card-body">
            <div className={`filemgr-thumb ${extension.className || 'text-dark'}`}>
                <i className={extension.icon || 'far fa-file'}></i>
            </div>
            <a href="#"
                onClick={handleLink}
                target="__blank" 
                className="stretched-link card-title card-link text-body font-size-sm d-block font-13 text-ellipsis"
                title={name}
            >
                {name || ""}
            </a>
            <small className="text-muted">{formatBytes(size)}</small>
            <div className="card-footer border-top-0 small text-muted">{moment(date, "YYYY/MM/DD HH:mm:ss").fromNow()}</div>
            <Show condicion={typeof onDelete == 'function'}>
                <span style={{ position: 'absolute', top: '0px', right: '5px', zIndex: "10" }}
                    className="cursor-pointer"
                    onClick={onDelete}
                >
                    <i className="fas fa-times"></i>
                </span>
            </Show>
            {/* loader */}
            <Show condicion={loading}>
                <CardLoader/>
            </Show>
        </div>
    )
}

// exportar
export default FileSimple;