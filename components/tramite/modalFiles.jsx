import React, { Component } from 'react'
import Modal from '../modal';
import { Form, Tab } from 'semantic-ui-react';
import Router from 'next/router';


const FileInfo = ({ files = [] }) => {

    const getMeta = (path) => {
        let key = path.split('.').pop()
        let metas = {
            pdf: { icon: "fas fa-file-pdf", className: "text-red" },
            docx: { icon: "fas fa-file-word", className: "text-primary" }
        };
        // response
        return metas[key];
    }

    return (
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Archivo</th>
                </tr>
            </thead>
            <tbody>
                {files.map((f, indexF) => 
                    <tr key={`file-tramite-${indexF}`}>
                        <th>
                            <i className={`${getMeta(f).icon} ${getMeta(f).className}`} /> {`${f}`.split('/').pop()}
                        </th>
                        <th>
                            <a href={f} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-search"></i>
                            </a>
                        </th>
                    </tr>
                )}
            </tbody>
        </table>
    )
}


const ModalFiles  = ({ files = [], isClose = null, onFile = null }) => {

    // render
    return (
        <Modal
            show={true}
            md="6"
            isClose={isClose}
            titulo={<span>Archivos del Trámite</span>}
            classClose="text-white opacity-1"
        >
            <Form className="card-body">
                <div className="pl-4 mt-4 pr-4 table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Archivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((f, indexF) => 
                                <tr key={`file-tracking-${f.id}-${indexF}`}>
                                    <th>
                                        <i className={`fas fa-${f.extname}`}></i> {f.name}
                                    </th>
                                    <th>
                                        <a href="#"
                                            onClick={(e) => typeof onFile == 'function' ? onFile(e, f) : null}
                                        >
                                            Ver
                                        </a>
                                    </th>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Form>
        </Modal>
    );
}

// exportar
export default ModalFiles;