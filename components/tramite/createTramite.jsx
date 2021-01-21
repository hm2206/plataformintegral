import React, { useState, useContext, useEffect, Fragment } from 'react';
import Modal from '../modal';
import { DropZone } from '../Utils';
import { Confirm } from '../../services/utils';
import { Form, Button } from 'semantic-ui-react';
import { signature, tramite } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';
import PdfView from '../pdfView';
import { PDFDocument } from 'pdf-lib/dist/pdf-lib';
import { AppContext } from '../../contexts/AppContext';
import { SelectAuthEntityDependencia } from '../select/authentication';
import { SelectTramiteType } from '../select/tramite';


const CreateTramite = ({ isClose = null, dependencia_id = "", user = {}, onSave = null }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const isUser = Object.keys(user).length;
    const [current_files, setCurrentFiles] = useState([]);

    // cambio de form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }
    
    // obtener files
    const handleFile = async (file) => {
        let size = 0;
        // obtener tamaño del archivo
        await current_files.map(f => size += f.size);
        let limite = 1024 * 6;
        if (limite >= (size / 1024)) setCurrentFiles([...current_files, file]);
    }

    // eliminar archivo del array
    const handleDeleteFile = async ({ index }) => {
        let newFiles = [];
        await current_files.filter((f, indexF) => indexF != index ? newFiles.push(f) : null);
        setCurrentFiles(newFiles);
    }

    // guardar el tramite
    const save = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar el tramite?`);
        if (answer) {
            app_context.fireLoading(true);
            let datos = new FormData;
            datos.append('person_id', user.person_id);
            await Object.keys(form).map(key => datos.append(key, form[key]));
            await current_files.map(f => datos.append('files', f));
            await tramite.post(`tramite`, datos, { headers: { DependenciaId: dependencia_id } })
                .then(res => {
                    app_context.fireLoading(false);
                    let { success, message, tramite } = res.data;
                    if (!success) throw new Error(message);
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    setErrors({})
                    setCurrentFiles([]);
                    if (typeof onSave == 'function') onSave(tramite);
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);
                        if (typeof data.errors != 'object') throw new Error(data.message);
                        Swal.fire({ icon: 'warning', text: data.message });
                        setErrors(data.errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }

    // render
    return <Fragment>
        <Modal show={true}
            isClose={isClose}
            titulo={<span><i className="fas fa-plus"></i> Trámite nuevo</span>}
        >
            <div className="card-body">
                <Form>
                    <h5>
                        <i className="fas fa-user"></i> Datos del Remitente
                        <hr/>
                    </h5>

                    <Show condicion={isUser} 
                        predeterminado={
                            <div className="text-center">
                                <b className="text-muted">No se encontró al remitente</b>
                            </div>
                        }
                    >
                        <Form.Field className="mb-3">
                            <label htmlFor="">N° Documento</label>
                            <input type="text" readOnly value={user && user.person && user.person.document_number || ""}/>
                        </Form.Field>

                        <Form.Field className="mb-3">
                            <label htmlFor="">Apellidos y Nombres</label>
                            <input type="text" readOnly className="uppercase" value={user && user.person && user.person.fullname || ""}/>
                        </Form.Field>
                    </Show>
                    <hr/>

                    <h5>
                        <i className="fas fa-file-alt"></i> Datos del Documento
                        <hr/>
                    </h5>

                    <Form.Field className="mb-3">
                        <label>Dependencia Origen</label>
                        <SelectAuthEntityDependencia
                            entity_id={app_context.entity_id}
                            value={dependencia_id}
                            disabled
                        />
                    </Form.Field>

                    <Form.Field className="mb-3" error={errors.type_tramite_id && errors.type_tramite_id[0] || ""}>
                        <label>Tipo de Trámite <b className="text-danger">*</b></label>
                        <SelectTramiteType
                            name="tramite_type_id"
                            value={form.tramite_type_id}
                            onChange={(e, target) => handleInput(target)}
                        />
                        <label>{errors.tramite_type_id && errors.tramite_type_id[0] || ""}</label>
                    </Form.Field>

                    <Form.Field className="mb-3" error={errors.document_number && errors.document_number[0] || ""}>
                        <label>N° Documento <b className="text-danger">*</b></label>
                        <input type="text"
                            name="document_number"
                            value={form.document_number || ""}
                            onChange={({ target }) => handleInput(target)}
                        />
                        <label>{errors.document_number && errors.document_number[0] || ""}</label>
                    </Form.Field>

                    <Form.Field className="mb-3" error={errors.asunto && errors.asunto[0] || ""}>
                        <label>Asunto <b className="text-danger">*</b></label>
                        <textarea 
                            name="asunto" 
                            rows="2"
                            value={form.asunto || ""}
                            onChange={({ target }) => handleInput(target)}
                        />
                        <label>{errors.asunto && errors.asunto[0] || ""}</label>
                    </Form.Field>

                    <Form.Field className="mb-3" error={errors.folio_count && errors.folio_count[0] || ""}>
                        <label>N° Folio <b className="text-danger">*</b></label>
                        <input type="number"
                            name="folio_count"
                            value={form.folio_count || ""}
                            onChange={({ target }) => handleInput(target)}
                        />
                        <label>{errors.folio_count && errors.folio_count[0] || ""}</label>
                    </Form.Field>

                    <Form.Field className="mb-3" error={errors.observation && errors.observation[0] || ""}>
                        <label>Observación</label>
                        <textarea 
                            name="observation" 
                            rows="5"
                            value={form.observation || ""}
                            onChange={({ target }) => handleInput(target)}
                        />
                        <label>{errors.observation && errors.observation[0] || ""}</label>
                    </Form.Field>

                    <Form.Field className="mb-3" error={errors.files && errors.files[0] || ""}>
                        <label>Archivos <b className="text-danger">*</b></label>
                        <DropZone
                            id="file-tramite-serve"
                            name="files"
                            title="Seleccinar PDF"
                            multiple={false}
                            accept="application/pdf"
                            result={current_files}
                            onSigned={({ file }) => handleFile(file)}
                            onChange={({ files }) => handleFile(files[0])}
                            onDelete={handleDeleteFile}
                        />
                        <label>{errors.files && errors.files[0] || ""}</label>
                    </Form.Field>

                    <hr/>

                    <div className="text-right">
                        <Button color="teal" onClick={save} disabled={!isUser}>
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    </Fragment>
}


export default CreateTramite;