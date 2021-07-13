import React, { useContext, useEffect, useMemo, useState } from 'react';
import Modal from '../modal';
import { Form, Button , Checkbox } from 'semantic-ui-react';
import { SelectDependencia } from '../select/authentication';
import Show from '../show';
import { DropZone } from '../Utils';
import { status } from './datos.json';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts/AppContext';
import { tramite } from '../../services/apis';
import Swal from 'sweetalert2';
import SearchUserToDependencia from '../authentication/user/searchUserToDependencia';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import SelectMultitleDependencia from './selectMultipleDependencia';
import { SelectConfigDependenciaDestino } from '../select/tramite';
import { EntityContext } from '../../contexts/EntityContext';
import { AuthContext } from '../../contexts/AuthContext';
import { collect } from 'collect.js';


const ModalNextTracking = ({ isClose = null, action = "", onSave = null }) => {

    // app
    const app_context = useContext(AppContext);

    // auth
    const { auth } = useContext(AuthContext);

    // entity
    const entity_context = useContext(EntityContext);

    // tramite
    const tramite_context = useContext(TramiteContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const is_errors = Object.keys(errors).length;
    const [current_files, setCurrentFiles] = useState([]);
    const [option, setOption] = useState("");
    const [users, setUsers] = useState([]);
    const [current_dependencias, setCurrentDependencias] = useState([]);
    const [current_multiple, setCurrentMultiple] = useState([]);

    // mostrar componentes
    const destino = ['DERIVADO', 'ENVIADO'];
    const descripcion = ['DERIVADO', 'RECHAZADO', 'FINALIZADO'];
    const archivos = ['DERIVADO', 'FINALIZADO'];
    const messages = ['ACEPTADO', 'ANULADO'];
    const current_tracking = tramite_context.current_tracking || {};
    const current_role = tramite_context.role || {};
    const current_boss = tramite_context.boss || {};

    const isPrivated = useMemo(() => {
        return form?.dependencia_destino_id == current_tracking.dependencia_id;
    }, [form]);

    const canNext = useMemo(() => {
        if (!destino.includes(action)) return true;
        if (isPrivated) return users.length ? true : false;
        return form.dependencia_destino_id ? true : false;
    }, [users, form]);

    const userChecked = useMemo(() => {
        let storage = collect(users);
        let checked = storage.pluck('id').toArray();
        return checked
    }, [users]);

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
        let userIds = collect(users).pluck('id').toArray();
        if (userIds.includes(obj.id)) return;
        let newObj = {
            id: obj.id,
            person_id: obj.person_id,
            fullname: obj.fullname,
            document_number: obj.document_number,
            is_action: 1
        };
        // next users
        setUsers(prev => [...prev, newObj]);
    }

    const onDeleteUser = async (obj) => {
        let newUsers = await users.filter(u => u.id != obj.id);
        setUsers(newUsers);
    }

    const onToggleCheckUser = async (obj, check) => {
        let newUsers = await users.map(u => {
            if (obj.id == u.id) u.is_action = check ? 1 : 0;
            // response
            return u;
        });
        // setting users
        setUsers(newUsers);
    }

    // obtener status
    const getStatus = () => status[action] || {};

    // executar 
    const execute = async () => {
        if (!messages.includes(action)) {
            let answer = await Confirm('warning', `¿Estás seguro en realizar la acción?`, 'Estoy seguro');
            if (!answer) return false; 
        }
        // executar
        app_context.setCurrentLoading(true);
        // setting datos
        let datos = new FormData;
        datos.append('status', action);
        await Object.keys(form).map(key => datos.append(key, form[key]));
        datos.delete('multiple');
        datos.delete('is_action');
        let newUsers = [...users];
        // agregar usuarios destinos
        if (newUsers.length) {
            let firstUsers = newUsers[0];
            datos.append('user_destino_id', firstUsers?.id);
            datos.append('is_action', firstUsers?.is_action ? 1 : 0);
            newUsers.splice(0, 1);
            // agregar usuarios multiples
            datos.append('users', JSON.stringify(newUsers));
        } else {
            datos.append('multiple', JSON.stringify(current_multiple));
            datos.append('is_action', form.is_action ? 1 : 0);
        }
        // agregar files
        await current_files.map(f => datos.append('files', f));
        // request
        await tramite.post(`tracking/${current_tracking.id}/next`, datos, { headers: { DependenciaId: tramite_context.dependencia_id } })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message, tracking } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            if (typeof onSave == 'function') onSave(tracking);
        }).catch(err => {
            try {
                app_context.setCurrentLoading(false);
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

    // obtener dependencias
    const handleDependencias = async(datos = []) => {
        datos.splice(0, 1);
        let payload = [];
        // setting data
        await datos.filter(d => {
            let { obj } = d;
            // add payload
            payload.push({
                id: `${obj.id}`,
                nombre: obj.nombre,
                type: obj.type
            });
        });
        // set datos
        setCurrentDependencias(payload)
    } 

    // eliminar item multiple
    const deleteMultiple = async (index) => {
        let answer = await Confirm('warning', `¿Estás seguro en eliminar?`, 'Eliminar');
        if (!answer) return false;
        let newMultiple = JSON.parse(JSON.stringify(current_multiple));
        newMultiple.splice(index, 1);
        setCurrentMultiple(newMultiple);
        if (!newMultiple.length) handleInput({ name: 'multiple', value: false });
    }

    // seleccionar dependencia destino predeterminado
    useEffect(() => {
        setForm({ dependencia_destino_id: tramite_context.dependencia_id, is_action: 1 });
    }, []);

    // clear multiple files
    useEffect(() => {
        if (!form.multiple) setCurrentMultiple([]);
    }, [form.multiple]);

    // cambio de dependencia limpiar user
    useEffect(() => {
        setUsers([]);
    }, [form?.dependencia_destino_id]);

    // render
    return (
        <Modal show={true}
            isClose={isClose} 
            titulo={<span><i className="fas fa-business-time"></i> Procesar trámite</span>}
        >
            <div className="card-body font-13">
                <Form>
                    <Show condicion={current_tracking.next && current_tracking.current && current_tracking.revisado}>
                        <Form.Field className="mb-3">
                            <label htmlFor="">Dependencia Destino</label>
                            <input type="text"
                                readOnly
                                value={current_tracking.tracking && current_tracking.tracking.dependencia && current_tracking.tracking.dependencia.nombre || ""}
                            />
                        </Form.Field>
                    </Show>

                    <Show condicion={!current_tracking.next}>
                        <Show condicion={destino.includes(action) && current_tracking.revisado}>
                            <Show condicion={(Object.keys(current_boss).length && current_boss.user_id == auth.id) || 
                                (current_tracking.modo == 'DEPENDENCIA' && Object.keys(current_role).length)}
                            >
                                <Form.Field className="mb-3" errors={is_errors && errors.dependencia_destino_id && errors.dependencia_destino_id[0] ? "true" : "false"}>
                                    <label htmlFor="">Dependencia Destino <b className="text-danger">*</b></label>
                                    <SelectConfigDependenciaDestino
                                        name="dependencia_destino_id"
                                        dependencia_id={tramite_context.dependencia_id}
                                        value={form.dependencia_destino_id}
                                        onChange={(e, obj) => handleInput(obj)}
                                        onReady={handleDependencias}
                                        disabled={form.multiple ? true : false}
                                    />
                                    <label>{is_errors && errors.dependencia_destino_id && errors.dependencia_destino_id[0] || ""}</label>
                                </Form.Field>

                                {/* muliple dependencias solo derivado */}
                                <Show condicion={tramite_context.dependencia_id != form.dependencia_destino_id}>
                                    <div className="row">
                                        <Form.Field className="col-md-6 col-6">
                                            <label htmlFor="">Dependencia Multiple</label>
                                            <div>
                                                <Checkbox 
                                                    toggle
                                                    name="multiple"
                                                    checked={form.multiple ? true : false}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked })}
                                                />
                                            </div>
                                        </Form.Field>

                                        <Form.Field className="col-md-6 col-6 text-right">
                                            <label htmlFor="">Acción</label>
                                            <div>
                                                <Checkbox 
                                                    toggle
                                                    name="is_action"
                                                    checked={form.is_action ? true : false}
                                                    onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                                />
                                            </div>
                                        </Form.Field>
                                    </div>
                                    {/* mostrar al selecionar el multiple dependencia */}
                                    <Show condicion={!current_multiple.length && form.multiple}>
                                        <SelectMultitleDependencia
                                            dependencias={current_dependencias}
                                            hidden={[form.dependencia_destino_id]}
                                            onReady={(datos) => setCurrentMultiple(datos)}
                                        />
                                    </Show>
                                    {/* mostrar dependencias multiples a enviar */}
                                    {current_multiple.map((m, indexM) => 
                                        <span className="capitalize badge badge-primary ml-1 mb-1"
                                            key={`list-badge-item-${indexM}`}
                                        >
                                            {m.nombre} <i className="fas fa-times cursor-pointer" onClick={deleteMultiple}></i>
                                        </span>    
                                    )}
                                </Show>
                            </Show>
                            
                            <Show condicion={isPrivated}>
                                <Form.Field className="mb-3">
                                    <label htmlFor="">Usuario Destino</label>
                                    <button className="btn btn-sm btn-outline-dark mb-2" onClick={(e) => setOption("ASSIGN")}>
                                    <span><i className="fas fa-plus"></i> Usuario</span>
                                    </button>
                                </Form.Field>

                                <Show condicion={destino.includes(action) && current_tracking.revisado && form.dependencia_destino_id == tramite_context.dependencia_id}>
                                    {users?.map(u => 
                                        <Form.Field className="mb-3" errors={is_errors && errors.user_destino_id && errors.user_destino_id[0] ? "true" : "false"}>
                                            <div className="row">
                                                <div className="col-md-9 col-9">
                                                    <input type="text"
                                                        className="uppercase"
                                                        readOnly
                                                        value={`${u?.document_number} - ${u?.fullname || ""}`}
                                                    />
                                                </div>
                                                <div className="col-md-2 col-2">
                                                    <Checkbox 
                                                        toggle
                                                        name="is_action"
                                                        checked={u.is_action ? true : false}
                                                        onChange={(e, obj) => onToggleCheckUser(u, obj.checked)}
                                                    />
                                                </div>
                                                <div className="col-md-1 col-1">
                                                    <button className="btn btn-ms btn-danger btn-block"
                                                        onClick={() => onDeleteUser(u)}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <label>{is_errors && errors.user_destino_id && errors.user_destino_id[0] || ""}</label>
                                            <hr/>
                                        </Form.Field>    
                                    )}
                                </Show>
                            </Show>
                        </Show>

                    </Show>

                    <Show condicion={descripcion.includes(action)}>
                        <Form.Field className="mb-3" errors={is_errors && errors.description && errors.description[0] ? "true" : "false"}>
                            <label htmlFor="">proveído</label>
                            <textarea name="description" rows="5"
                                value={form.description || ""}
                                onChange={({ target }) => handleInput(target)}
                            />
                            <label>{is_errors && errors.description && errors.description[0] || ""}</label>
                        </Form.Field>
                    </Show>

                    <Show condicion={archivos.includes(action)}>
                        <Form.Field className="mb-3" error={is_errors && errors.files && errors.files[0] ? "true" : "false"}>
                            <label>Archivos</label>
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

                    <Show condicion={messages.includes(action)}>
                        <div className="mt-3 text-center mb-5" style={{ fontSize: '17px' }}>
                            <div><i className="fas fa-info-circle"></i></div>
                            ¿Estás seguro en continuar...?
                        </div>
                    </Show>

                    <div className="mt-3 text-right">
                        <Button color={getStatus().color}
                            disabled={!canNext}
                            onClick={execute}
                        >
                            <i className={`fas ${getStatus().icon}`}></i> {getStatus().label} 
                        </Button>
                    </div>
                </Form>

                <Show condicion={option == 'ASSIGN'}>
                    <SearchUserToDependencia
                        onClose={(e) => setOption("")}
                        hidden={[auth.id]}
                        getAdd={handleAdd}
                        entity_id={entity_context.entity_id}
                        dependencia_id={tramite_context.dependencia_id}
                        disabled={userChecked}
                    />
                </Show>
            </div>
        </Modal>
    )
}

// exportar
export default ModalNextTracking;