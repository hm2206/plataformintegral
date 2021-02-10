import React, { useContext, useEffect, useState } from 'react';
import Modal from '../modal';
import { Form, Button } from 'semantic-ui-react';
import { SelectDependencia } from '../select/authentication';
import Show from '../show';
import { DropZone } from '../Utils';
import { status } from './datos.json';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts/AppContext';
import { tramite } from '../../services/apis';
import Swal from 'sweetalert2';
import SearchUserToDependencia from '../authentication/user/searchUserToDependencia';
import { TramiteContext } from '../../contexts/TramiteContext';


const ModalNextTracking = ({ isClose = null, action = "", onSave = null }) => {

    // app
    const app_context = useContext(AppContext);

    // tramite
    const tramite_context = useContext(TramiteContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const is_errors = Object.keys(errors).length;
    const [current_files, setCurrentFiles] = useState([]);
    const [option, setOption] = useState("");
    const [user, setUser] = useState({});
    const isUser = Object.keys(user).length;

    // mostrar componentes
    const destino = ['DERIVADO'];
    const descripcion = ['ANULADO', 'DERIVADO', 'ACEPTADO', 'RECHAZADO', 'RESPONDIDO', 'FINALIZADO'];
    const archivos = ['DERIVADO', 'RESPONDIDO'];

    const current_tracking = tramite_context.tracking || {};
    const current_role = tramite_context.role || {};
    const current_boss = tramite_context.boss || {};

    // combiar form
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

    // obtener usuario
    const handleAdd = async (obj) => {
        setOption("");
        setUser(obj);
    }

    // obtener status
    const getStatus = () => status[action] || {};

    // executar 
    const execute = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en realizar la acción?`, 'Estoy seguro');
        if (answer) {
            app_context.fireLoading(true);
            // setting datos
            let datos = new FormData;
            datos.append('status', action);
            await Object.keys(form).map(key => datos.append(key, form[key]));
            // agregar usuario destino
            if (isUser) datos.append('user_destino_id', user.id);
            // agregar files
            await current_files.map(f => datos.append('files', f));
            // request
            await tramite.post(`tracking/${current_tracking.id}/next`, datos, { headers: { DependenciaId: tramite_context.dependencia_id } })
                .then(async res => {
                    app_context.fireLoading(false);
                    let { success, message, current_tracking } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    if (typeof onSave == 'function') onSave(current_tracking);
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);
                        if (typeof data.errors != 'object') throw new Error(data.message);
                        setErrors(data.errors);
                        Swal.fire({ icon: 'warning', text: data.message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }

    // seleccionar dependencia destino predeterminado
    useEffect(() => {
        setForm({ dependencia_destino_id: tramite_context.dependencia_id });
    }, []);

    // render
    return (
        <Modal show={true}
            isClose={isClose} 
            titulo={<span><i className="fas fa-business-time"></i> Procesar trámite</span>}
        >
            <div className="card-body font-13">
                <Form>
                    <Form.Field className="mb-3">
                        <label htmlFor="">Dependencia Origen</label>
                        <span className="uppercase">
                            <input type="text" 
                                readOnly 
                                className="uppercase" 
                                value={current_tracking.dependencia_origen && current_tracking.dependencia_origen.nombre || ""}
                            />
                        </span>
                    </Form.Field>

                    <Show condicion={destino.includes(action) && current_tracking.revisado}>
                        <Show condicion={(Object.keys(current_boss).length && current_boss.user_id == app_context.auth.id) || 
                            (current_tracking.modo == 'DEPENDENCIA' && Object.keys(current_role).length)}
                        >
                            <Form.Field className="mb-3" errors={is_errors && errors.dependencia_destino_id && errors.dependencia_destino_id[0] ? true : false}>
                                <label htmlFor="">Dependencia Destino <b className="text-danger">*</b></label>
                                <SelectDependencia
                                    name="dependencia_destino_id"
                                    value={form.dependencia_destino_id}
                                    onChange={(e, obj) => handleInput(obj)}
                                />
                                <label>{is_errors && errors.dependencia_destino_id && errors.dependencia_destino_id[0] || ""}</label>
                            </Form.Field>
                        </Show>
                    </Show>

                    <Show condicion={destino.includes(action) && current_tracking.revisado && form.dependencia_destino_id == tramite_context.dependencia_id}>
                        <Form.Field className="mb-3" errors={is_errors && errors.user_destino_id && errors.user_destino_id[0] || ""}>
                            <label htmlFor="">Usuario Destino</label>
                            <div className="row">
                                <Show condicion={isUser}>
                                    <div className="col-md-10 col-lg-11">
                                        <input type="text"
                                            className="uppercase"
                                            disabled
                                            value={`${user.document_number} - ${user.fullname || ""}`}
                                        />
                                    </div>
                                </Show>
                                <div className="col-md-2 col-lg-1">
                                    <button className="btn btn-sm btn-outline-dark mb-2" onClick={(e) => setOption("ASSIGN")}>
                                        {isUser ? <i className="fas fa-sync"></i> : <i className="fas fa-plus"></i>}
                                    </button>
                                </div>
                            </div>
                            <label>{is_errors && errors.user_destino_id && errors.user_destino_id[0] || ""}</label>
                            <hr/>
                        </Form.Field>
                    </Show>

                    <Show condicion={descripcion.includes(action)}>
                        <Form.Field className="mb-3" errors={is_errors && errors.description && errors.description[0] ? true : false}>
                            <label htmlFor="">Descripción <b className="text-danger">*</b></label>
                            <textarea name="description" rows="5"
                                value={form.description || ""}
                                onChange={({ target }) => handleInput(target)}
                            />
                            <label>{is_errors && errors.description && errors.description[0] || ""}</label>
                        </Form.Field>
                    </Show>

                    <Show condicion={archivos.includes(action)}>
                        <Form.Field className="mb-3" error={is_errors && errors.files && errors.files[0] || ""}>
                            <label>Archivos <b className="text-danger">*</b></label>
                            <DropZone
                                id="file-tramite-serve-next-tramite"
                                name="files"
                                title="Seleccinar PDF"
                                accept="application/pdf"
                                result={current_files}
                                multiple={false}
                                onSigned={({ file }) => handleFile(file)}
                                onChange={({ files }) => handleFile(files[0])}
                                onDelete={handleDeleteFile}
                            />
                            <label>{is_errors && errors.files && errors.files[0] || ""}</label>
                        </Form.Field>
                    </Show>

                    <hr/>

                    <div className="mt-3 text-right">
                        <Button color={getStatus().color}
                            onClick={execute}
                        >
                            <i className={`fas ${getStatus().icon}`}></i> {getStatus().label} 
                        </Button>
                    </div>
                </Form>

                <Show condicion={option == 'ASSIGN'}>
                    <SearchUserToDependencia
                        isClose={(e) => setOption("")}
                        getAdd={handleAdd}
                        entity_id={app_context.entity_id}
                        dependencia_id={tramite_context.dependencia_id}
                    />
                </Show>
            </div>
        </Modal>
    )
}

// exportar
export default ModalNextTracking;