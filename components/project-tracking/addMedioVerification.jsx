import React, { useState, useContext, useEffect } from 'react';
import Modal from '../modal';
import { Button, Loader } from 'semantic-ui-react';
import { AppContext } from '../../contexts/AppContext';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import Anexos from './anexos';
import { Confirm } from '../../services/utils'

// item
const ItemVerification = ({ obj, index, onPaperclip = null, onUpdate = null, editable = true }) => {

    // estados
    const [edit, setEdit] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [form, setForm] = useState(JSON.parse(JSON.stringify(obj)));
    const [error, setError] = useState(false);

    // habilitar y desabilitar edición
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // cancelar edicion
    useEffect(() => {
        if (!edit) setForm(JSON.parse(JSON.stringify(obj)));
    }, [edit]);

    // actualizar datos
    const update = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en actualizar los datos?`);
        if (answer) {
            setCurrentLoading(true);
            await projectTracking.post(`medio_verification/${form.id}/update`, form)
                .then(async res => {
                    let { message, medio_verification } = res.data;
                    if (typeof onUpdate == 'function') await onUpdate(index, medio_verification);
                    await Swal.fire({ icon: 'success', text: message });
                    setError(false);
                    setEdit(false);
                })
                .catch(err => {
                    try {
                        setError(true)
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);
                        if (typeof data.errors != 'object') throw new Error(data.message);
                        Swal.fire({ icon: 'warning', text: data.message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });   
                    }
                })
            setCurrentLoading(false);
        }
    }

    // render
    return (
        <tr>
            <td>
                <Show condicion={edit}
                    predeterminado={form.description}
                >
                    <textarea name="description" 
                        value={form.description} rows={3}
                        onChange={({target}) => handleInput(target)}   
                        disabled={current_loading}                                 
                    />
                </Show>
            </td>
            <td className="text-center">
                <Show condicion={!edit || !current_loading}>
                    <a href="#" onClick={onPaperclip}>
                        <i className="fas fa-paperclip"></i>
                    </a>
                </Show>
            </td>
            <Show condicion={editable}>
                <td className="text-center">
                    <Show condicion={!current_loading}
                        predeterminado={<Loader active inline />}
                    >
                        <div className="btn-group">
                            <button className={`btn btn-sm btn-outline-${edit ? 'red' : 'primary'}`}
                                onClick={(e) => setEdit(!edit)}
                            >
                                <i className={`fas fa-${edit ? 'times' : 'edit'}`}></i>
                            </button>

                            <Show condicion={edit}>
                                <button className="btn btn-sm btn-outline-success"
                                    onClick={update}
                                >
                                    <i className="fas fa-save"></i>
                                </button>
                            </Show>
                        </div>
                    </Show>
                </td>
            </Show>
        </tr>    
    )
}

// agregar verification
const AddMedioVerification = ({ isClose, meta, editable = true }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [description, setDescription] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [error, setError] = useState(false);
    const [option, setOption] = useState("");
    const [current_medio_verification, setCurrentMedioVerification] = useState({});

    // obtener
    const getMedioVerification = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`meta/${meta.id}/medio_verification`)
            .then(res => {
                let { medio_verifications } = res.data;
                setDatos(add ? [...datos, ...medio_verifications.data] : medio_verifications.data);
                setError(false);
            }).catch(err => setError(true));
        setCurrentLoading(false);
    }

    // cargar config
    useEffect(() => {
        getMedioVerification();
    }, []);

    // crear
    const create = async () => {
        app_context.setCurrentLoading(true);
        await projectTracking.post(`medio_verification`, { description, meta_id: meta.id })
            .then(res => {
                app_context.setCurrentLoading(false);
                let { message, medio_verification } = res.data;
                Swal.fire({ icon: 'success', text: message });
                setDescription("");
                setDatos([...datos, medio_verification]);
            }).catch(err => {
                try {
                    app_context.setCurrentLoading(false);
                    let { data } = err.response;
                    console.log(data);
                    if (typeof data != 'object') throw new Error(err.message);
                    if (typeof data.errors != 'object') throw new Error(data.message);
                    Swal.fire({ icon: 'warning', text: data.message });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: error.message });
                }
            });
    }

    // actualizar medios de verification
    const updateMedioVerification = (index, obj) => {
        let newDatos = JSON.parse(JSON.stringify(datos));
        newDatos[index] = obj;
        setDatos(newDatos);
    }

    // render
    return <Modal titulo={<span><i className="fas fa-plus"></i> Agregar Medio de Verificación</span>}
        show={true}
        isClose={isClose}
        md="7"
    >
        <div className="card-body">
            <Show condicion={editable}>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th colSpan={2}>Indicador</th>
                        </tr>
                        <tr>
                            <td colSpan={2}>{meta.description || ""}</td>
                        </tr>
                        <tr>
                            <th>Descripción</th>
                            <th className="text-center" width="10%">Agregar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <textarea value={description || ""} onChange={({ target }) => setDescription(target.value)} rows="3"/>
                            </td>
                            <td>
                                <Button color="green"
                                    disabled={current_loading || !description}
                                    onClick={create}
                                >
                                    <i className="fas fa-plus"></i>
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Show>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th width="10%" className="text-center">Anexos</th>
                        <Show condicion={editable}>
                            <th width="15%" className="text-center">Acciones</th>
                        </Show>
                    </tr>
                </thead>
                <tbody>

                    {datos.map((d, indexD) => 
                        <ItemVerification 
                            key={`list-medio-verification-${indexD}`} 
                            index={indexD} 
                            onUpdate={updateMedioVerification}
                            editable={editable}
                            onPaperclip={(e) => {
                                e.preventDefault();
                                setOption('ANEXOS');
                                setCurrentMedioVerification(d);
                            }}
                            obj={d}
                        /> 
                    )}
                    
                    <Show condicion={current_loading}>
                        <tr>
                            <td><Skeleton/></td>
                            <td><Skeleton/></td>
                            <td><Skeleton/></td>
                        </tr>
                    </Show>

                    <Show condicion={!current_loading && !datos.length}>
                        <tr>
                            <td className="text-center" colSpan={editable ? 3 : 2}>
                                No hay medios de verificación
                                <a href="#" className="ml-2" onClick={(e) => {
                                    e.preventDefault();
                                    getMedioVerification();
                                }}>
                                    <i className="fas fa-sync"></i>
                                </a>
                            </td>
                        </tr>
                    </Show>
                </tbody>
            </table>
        </div>

        <Show condicion={option == 'ANEXOS'}>
            <Anexos
                editable={editable}
                object_id={current_medio_verification.id}
                object_type={'App/Models/MedioVerification'}
                isClose={(e) => setOption("")}
            />
        </Show>
    </Modal>;
}

// export 
export default AddMedioVerification;