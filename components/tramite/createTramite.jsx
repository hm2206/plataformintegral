import React, { useState, useContext, Fragment } from 'react';
import Modal from '../modal';
import { DropZone } from '../Utils';
import { Confirm, formatBytes } from '../../services/utils';
import { Form, Button, Progress } from 'semantic-ui-react';
import { tramite, CancelRequest, handleErrorRequest } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { SelectAuthEntityDependencia } from '../select/authentication';
import { SelectTramiteType } from '../select/tramite';
import { onProgress } from '../../services/apis';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { EntityContext } from '../../contexts/EntityContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import uid from 'uid';
import { useMemo } from 'react';


const CreateTramite = ({ show = true, isClose = null, user = {}, onSave = null }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // tramite
    const tramite_context = useContext(TramiteContext);
    const { current_tramite, dispatch, setNext } = tramite_context;

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const isUser = Object.keys(user).length;
    const isTramite = Object.keys(current_tramite).length;
    const [current_files, setCurrentFiles] = useState([]);
    const [current_loading, setCurrentLoading] = useState(false);
    const [percent, setPercent] = useState(0);
    const [current_cancel, setCurrentCancel] = useState(null);
    const [slug, setSlug] = useState(`${uid(10)}`.toUpperCase());

    let linkPath = useMemo(() => {
        return `${tramite.path}/file?disk=tmp&path=/tramite/${slug}/`;
    }, [slug]);

    const generateSlug = () => {
        return `${uid(10)}`.toUpperCase();
    }

    // cambio de form
    const handleInput = async ({ name, value }, callback = true) => {
        let newForm = Object.assign({}, form);
        let newErrors = Object.assign({}, errors);
        if (typeof callback == 'function') {
            let _result = callback(value);
            if (_result) {
                newForm[name] = value;
                setForm(newForm);
                newErrors[name] = [];
                setErrors(newErrors);
            }
        } else {
            newForm[name] = value;
            setForm(newForm);
            newErrors[name] = [];
            setErrors(newErrors);
        }
    }
    
    // obtener files
    const handleFile = async (file) => {
        let size = 0;
        // obtener tamaño del archivo
        await current_files.map(f => size += f.size);
        let limite = 1024 * 25;
        if (limite >= (size / 1024)) setCurrentFiles([...current_files, file]);
        else Swal.fire({ icon: 'warning', text: `El límite de 25MB fué superado (${formatBytes(size)})` })
    }

    // eliminar archivo del array
    const handleDeleteFile = async ({ index }) => {
        let newFiles = [];
        await current_files.filter((f, indexF) => indexF != index ? newFiles.push(f) : null);
        setCurrentFiles(newFiles);
    }

    // limpiar datos anteriores
    const handleClose = () => {
        setNext("");
        dispatch({ type: tramiteTypes.CHANGE_TRAMITE });
        if (typeof isClose == 'function') isClose();
    }

    // cancelar solicitud
    const handleCancel = () => current_cancel && current_cancel.cancel();

    // guardar el tramite
    const save = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar el tramite?`);
        if (!answer) return false;
        let cancelToken = CancelRequest();
        setCurrentCancel(cancelToken);
        setCurrentLoading(true);
        let datos = new FormData;
        datos.append('person_id', user.person_id);
        datos.append('next', tramite_context.next);
        datos.append('slug', slug);
        if (isTramite) datos.append('tramite_id', current_tramite.id || "");
        await Object.keys(form).map(key => datos.append(key, form[key]));
        await current_files.map(f => datos.append('files', f));
        await tramite.post(`tramite`, datos, { 
            onUploadProgress: (evt) => onProgress(evt, setPercent),
            onDownloadProgress: (evt) => onProgress(evt, setPercent),
            cancelToken: cancelToken.token,
            headers: { DependenciaId: tramite_context.dependencia_id } 
        }).then(res => {
            let { success, message, tramite } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message });
            setForm({});
            setErrors({})
            setCurrentFiles([]);
            setSlug(generateSlug());
            if (typeof onSave == 'function') onSave(tramite);
        }).catch(err => handleErrorRequest(err, setErrors));
        // quitar loader
        setTimeout(() => setCurrentLoading(false), 1000);
    }

    // render
    return <Fragment>
        <Modal show={show}
            isClose={handleClose}
            disabled={current_loading}
            titulo={<span><i className="fas fa-plus"></i> Trámite nuevo</span>}
        >
            <div className="card-body">
                <Form>
                    <Show condicion={isTramite}>
                        <div className="card" style={{ border: '1px solid #000' }}>
                            <div className="card-body">
                                <h5>
                                    <i className="fas fa-file-alt"></i> Datos del Trámite raíz
                                    <hr/>
                                </h5>

                                <Form.Field className="mb-3">
                                    <label>Dependencia Origen</label>
                                    <input type="text"
                                        className="capitalize"
                                        readOnly
                                        value={current_tramite.dependencia_origen && current_tramite.dependencia_origen.nombre || "Externo"}
                                    />
                                </Form.Field>

                                <Form.Field className="mb-3">
                                    <label>Tipo de Documento</label>
                                    <input type="text"
                                        className="capitalize"
                                        readOnly
                                        value={current_tramite.tramite_type && current_tramite.tramite_type.description || ""}
                                    />
                                </Form.Field>

                                <Form.Field className="mb-3">
                                    <label>N° Documento</label>
                                    <input type="text"
                                        className="capitalize"
                                        readOnly
                                        value={current_tramite.document_number || ""}
                                    />
                                </Form.Field>

                                <Form.Field className="mb-3">
                                    <label>Asunto</label>
                                    <textarea 
                                        value={current_tramite.asunto || ""}
                                        rows={3}
                                        readOnly
                                    />
                                </Form.Field>

                                <Show condicion={current_tramite.observation}>
                                    <Form.Field className="mb-3">
                                        <label>Observación</label>
                                        <textarea 
                                            value={current_tramite.observation || ""}
                                            rows={3}
                                            readOnly
                                        />
                                    </Form.Field>
                                </Show>
                            </div>
                        </div>
                    </Show>

                    <div className="card">
                        <div className="card-body">
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
                                    entity_id={entity_context.entity_id}
                                    value={tramite_context.dependencia_id}
                                    disabled
                                />
                            </Form.Field>

                            <Form.Field className="mb-3" error={errors.type_tramite_id && errors.type_tramite_id[0] ? true : false}>
                                <label>Tipo de Documento <b className="text-danger">*</b></label>
                                <SelectTramiteType
                                    name="tramite_type_id"
                                    value={form.tramite_type_id}
                                    onChange={(e, target) => handleInput(target)}
                                    error={errors.tramite_type_id && errors.tramite_type_id[0] ? true : false}
                                />
                                <label>{errors.tramite_type_id && errors.tramite_type_id[0] || ""}</label>
                            </Form.Field>

                            <Form.Field className="mb-3" error={errors.document_number && errors.document_number[0] ? true : false}>
                                <label>N° Documento <b className="text-danger">*</b></label>
                                <input type="text"
                                    name="document_number"
                                    value={form.document_number || ""}
                                    onChange={({ target }) => handleInput(target)}
                                />
                                <label>{errors.document_number && errors.document_number[0] || ""}</label>
                            </Form.Field>

                            <Form.Field className="mb-3" error={errors.asunto && errors.asunto[0] ? true : false}>
                                <label>Asunto <b className="text-danger">*</b></label>
                                <textarea 
                                    name="asunto" 
                                    rows="2"
                                    value={form.asunto || ""}
                                    onChange={({ target }) => handleInput(target)}
                                />
                                <label>{errors.asunto && errors.asunto[0] || ""}</label>
                            </Form.Field>

                            <Form.Field className="mb-3" error={errors.observation && errors.observation[0] ? true : false}>
                                <label>Observación</label>
                                <textarea 
                                    name="observation" 
                                    rows="5"
                                    value={form.observation || ""}
                                    onChange={({ target }) => handleInput(target)}
                                />
                                <label>{errors.observation && errors.observation[0] || ""}</label>
                            </Form.Field>

                            <Form.Field className="mb-3" error={errors.files && errors.files[0] ? true : false}>
                                <label>Archivos <b className="text-danger">*</b></label>
                                <DropZone
                                    linkCodeQr={linkPath}
                                    id="file-tramite-serve"
                                    name="files"
                                    title="Seleccinar (*.pdf y *.docx)"
                                    multiple={false}
                                    size={25}
                                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                                    result={current_files}
                                    onSigned={({ file }) => handleFile(file)}
                                    onChange={({ files }) => handleFile(files[0])}
                                    onDelete={handleDeleteFile}
                                />
                                <label>{errors.files && errors.files[0] || ""}</label>
                            </Form.Field>

                            <hr/>

                            <div className="text-right" style={{ position: 'relative' }}>
                                <Show condicion={!current_loading}>
                                    <Button color="teal" onClick={save}
                                        disabled={!isUser}
                                    >
                                        <i className="fas fa-save"></i> Guardar
                                    </Button>
                                </Show>

                                <Show condicion={current_loading}>
                                    <div className="w-100" onClick={handleCancel}>
                                        <Progress percent={percent} 
                                            progress
                                            inverted
                                            color="blue"
                                            disabled={percent == 100}
                                        />
                                    </div>
                                </Show>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </Modal>
    </Fragment>
}


export default CreateTramite;