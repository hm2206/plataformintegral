import React, { Component, useState, useEffect, useContext } from 'react'
import Modal from '../modal';
import { Button, Form, Dropdown, Tab } from 'semantic-ui-react';
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { TramiteContext } from '../../contexts/TramiteContext';

const ModalInfo = ({ current_tramite = {}, isClose = null, onFile = null }) => {

    // state
    const [option, setOption] = useState("");
    const [current_file, setCurrentFile] = useState({});

    // response
    return (
        <Modal
            show={true}
            md="6"
            isClose={isClose}
            titulo={<span>Información del Documento <small className="badge badge-dark"></small></span>}
            classClose="text-white opacity-1"
        >
            <Form className="card-body">
                <div className="mb-3">
                    <label htmlFor="">Dependencia Origen</label>
                    <input type="text" 
                        readOnly
                        value={current_tramite.dependencia_origen && current_tramite.dependencia_origen.nombre || "Externo"}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Tipo Trámite</label>
                    <input type="text" 
                        readOnly
                        value={current_tramite.tramite_type && current_tramite.tramite_type.description || ""}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">N° Documento</label>
                    <input type="text" 
                        readOnly
                        value={current_tramite.document_number || ""}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Asunto</label>
                    <textarea type="text" 
                        readOnly
                        rows="3"
                        value={current_tramite.asunto || ""}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">N° Folio</label>
                    <input type="text" 
                        readOnly
                        value={current_tramite.folio_count || ""}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="">Observación</label>
                    <textarea type="text" 
                        readOnly
                        rows="4"
                        value={current_tramite.observation || ""}
                    />
                </div>


                <div className="mb-3">
                    <hr/>
                    <label><i className="fas fa-file-alt"></i> Archivos</label>
                    <hr/>
                </div>

                <Show condicion={current_tramite && current_tramite.files && current_tramite.files.length || false}>
                    {current_tramite.files.map((f, indexF) => 
                        <div className="" key={`list-tramite-files-${indexF}`}>
                            <div className="card card-body cursor-pointer"
                                onClick={(e) => typeof onFile == 'function' ? onFile(e, f) : null}
                            >
                                {f.name}
                            </div>
                        </div>
                    )}
                </Show>
            </Form>
        </Modal>
    );
}

// exportar
export default ModalInfo;