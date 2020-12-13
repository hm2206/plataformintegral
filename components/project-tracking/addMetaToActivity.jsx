import React, { useState, useEffect, useContext, Fragment } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts/AppContext';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';

const AddMetaToActivity = ({ objective }) => {

    // app
    const app_context = useContext(AppContext);

    // proyecto
    const { project } = useContext(ProjectContext);

    // estados
    const [description, setDescription] = useState("");
    const [current_medio_verification, setCurrentMedioVerification] = useState("");
    const [medio_verification, setMedioVerification] = useState([]);
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_meta, setCurrentMeta] = useState([]);

    // add medio de verificacion para crear
    const addCurrentMedioVerification = async () => {
        let newMedioVerification = JSON.parse(JSON.stringify(medio_verification));
        newMedioVerification.push(current_medio_verification);
        setMedioVerification(newMedioVerification);
        setCurrentMedioVerification("");
    }

    const addMedioVerification = async (obj, index) => {
        obj.medio_verification.push(obj.medio_verification_text);
        delete obj.medio_verification_text;
        let newMetas = JSON.parse(JSON.stringify(current_meta));
        newMetas[index] = obj;
        setCurrentMeta(newMetas);
    }

    // delete medio al editar
    const deleteCurrentMedioVerification = async (index) => {
        let newMedioVerification = JSON.parse(JSON.stringify(medio_verification));
        newMedioVerification.splice(index, 1);
        setMedioVerification(newMedioVerification);
    }

    // add meta
    const addMeta = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar el indicador?`, 'Guardar');
        if (answer) {
            app_context.fireLoading(true);
            let datos = {};
            datos.object_id = objective.id;
            datos.object_type = 'App/Models/Objective';
            datos.description = description;
            datos.medio_verification = JSON.stringify(medio_verification);
            await projectTracking.post(`meta`, datos)
                .then(res => {
                    app_context.fireLoading(false);
                    let { success, message, meta } = res.data;
                    if (!success) throw new Error(message);
                    Swal.fire({ icon: 'success', text: message });
                    setDescription("");
                    setCurrentMedioVerification("");
                    setMedioVerification([]);
                    getMetas();
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { message, errors } = res.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message || err.message });
                    }
                });
        }
    }

    // delete meto
    const deleteMeta = async (index, obj) => {
        let answer = await Confirm('warning', `¿Deseas eliminar el indicador?`, 'Eliminar');
        if (answer) {
            app_context.fireLoading(true);
            await projectTracking.post(`meta/${obj.id}/delete`)
                .then(res => {
                    app_context.fireLoading(false);
                    let { message, success } = res.data;
                    if (!success) throw new Error(message);
                    Swal.fire({ icon: 'success', text: message });
                    let newMetas = JSON.parse(JSON.stringify(current_meta));
                    newMetas.splice(index, 1);
                    setCurrentMeta(newMetas);
                }).catch(err => {
                    app_context.fireLoading(false);
                    let { message } = err.response.data;
                    Swal.fire({ icon: 'error', text: message || err.message });
                });
        }
    }

    // obtener metas
    const getMetas = async (nextPage = 1, up = false) => {
        await projectTracking.get(`objective/${objective.id}/meta?page=${nextPage}`)
            .then(async res => {
                let { metas, success, message } = res.data;
                if (!success) throw new Error(message);
                setCurrentMeta(up ? [...current_meta, ...metas.data] : metas.data);
                if (metas.last_page > nextPage + 1) await getMetas(nextPage + 1, true);
            }).catch(err => console.log(err));
    }
    
    // habilitar editar meta
    const handleEdit = async (obj, index) => {
        let newMetas = JSON.parse(JSON.stringify(current_meta));
        obj._edit = obj._edit ? false : true;
        if (obj._edit) {
            obj.current_description = obj.description;
            obj.current_medio_verification = JSON.parse(JSON.stringify(obj.medio_verification));
        } else {
            obj.description = obj.current_description;
            obj.medio_verification = JSON.parse(JSON.stringify(obj.current_medio_verification));
        }
        // setting
        newMetas[index] = obj;
        setCurrentMeta(newMetas);
    }

    // modificar meta
    const handleInput = (obj, index, { name, value }) => {
        let newMetas = JSON.parse(JSON.stringify(current_meta));
        obj[name] = value;
        newMetas[index] = obj;
        setCurrentMeta(newMetas);
    }

    // modificar medio verificacion
    const updateMedioVerification = (obj, index, indexM, { value }) => {
        let newMetas = JSON.parse(JSON.stringify(current_meta));
        obj.medio_verification[indexM] = value;
        newMetas[index] = obj;
        setCurrentMeta(newMetas);
    }

    const deleteMedioVerification = (obj, index, indexM) => {
        let newMetas = JSON.parse(JSON.stringify(current_meta));
        obj.medio_verification.splice(indexM, 1);
        newMetas[index] = obj;
        setCurrentMeta(newMetas);
    }

    // actualizar datos
    const updateMeta = async (obj, index) => {
        let answer = await Confirm('warning', `¿Deseas actualizar el indicador?`, 'Actualizar');
        if (answer) {
            app_context.fireLoading(true);
            let datos = Object.assign({}, obj);
            datos.medio_verification = JSON.stringify(datos.medio_verification);
            await projectTracking.post(`meta/${obj.id}/update`, datos)
                .then(res => {
                    app_context.fireLoading(false);
                    let { success, message, meta } = res.data;
                    if (!success) throw new Error(message);
                    Swal.fire({ icon: 'success', text: message });
                    let newMetas = JSON.parse(JSON.stringify(current_meta));
                    newMetas[index] = meta;
                    setCurrentMeta(newMetas);
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { message, errors } = res.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message || err.message });
                    }
                });
        }
    }

    // primera carga
    useEffect(() => {
        if (objective.id) getMetas();
    }, []);

    // render
    return <div className="table-responsive font-12">
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th className="text-center">Indicadores del objectivo</th>
                    <th className="text-center">Medios de Verificación</th>
                    <th className="text-center">Agregar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <textarea 
                            name="description" 
                            rows="4"
                            onChange={({target}) => setDescription(target.value)}
                            value={description}
                        />
                    </td>
                    <td>
                        <div className="row">
                            {/* agregar medio de verificación */}
                            <div className="col-md-10">
                                <textarea name="medio_verification" 
                                    rows={2}
                                    value={current_medio_verification || ""}
                                    onChange={({target}) => setCurrentMedioVerification(target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-sm btn-outline-success"
                                    disabled={!current_medio_verification}
                                    onClick={addCurrentMedioVerification}
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                            <div className="col-md-12">
                                <hr/>
                            </div>
                            {/* listar medio de verificación */}
                            {medio_verification.map((v, indexV) => 
                                <div className="col-md-12" key={`medio_verification_${indexV}`}>
                                    <div className="row">
                                        <div className="col-md-10 col-12 mb-2" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}><b>{v}</b></div>
                                        <div className="col-md-2 col-2 mb-2">
                                            <button className="btn btn-sm btn-outline-danger"
                                                onClick={(e) => deleteCurrentMedioVerification(indexV)}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>    
                            )}
                        </div>
                    </td>
                    <td width="5%">
                        <Button
                            color="green"
                            disabled={!description || !medio_verification.length}
                            onClick={addMeta}
                        >
                            <i className="fas fa-plus"></i>
                        </Button>
                    </td>
                </tr>
                {current_meta.map((m, indexM) =>
                    <tr key={`meta-indicador-${indexM}`}>
                        <td>
                            <Show condicion={m._edit}
                                predeterminado={<b>{m.description}</b>}
                            >
                                <textarea 
                                    name="description" 
                                    rows="4"
                                    value={m.description || ""}
                                    onChange={({target}) => handleInput(m, indexM, target)}
                                />
                            </Show>
                        </td>
                        <td>
                            <Show condicion={m.medio_verification && m.medio_verification.length}>
                                <ul>
                                    <Show condicion={m._edit}>
                                        <li>
                                            <div className="row mb-2">
                                                <div className="col-md-10">
                                                    <textarea 
                                                        name="medio_verification_text" 
                                                        rows={1}
                                                        value={m.medio_verification_text || ""}
                                                        onChange={({target}) => handleInput(m, indexM, target)}
                                                    />
                                                </div>

                                                <div className="col-md-2">
                                                    <button className="btn btn-sm btn-outline-success"
                                                        onClick={(e) => addMedioVerification(m, indexM)}
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    </Show>
                                    
                                    {m.medio_verification.map((m_v, indexMV) => 
                                        <li key={`index-medio-verification-${indexMV}`}>
                                            <Show condicion={m._edit}
                                                predeterminado={m_v}
                                            >
                                                <Fragment>
                                                    <div style={{ position: "relative" }}>
                                                        <textarea 
                                                            className={`mb-1 ${m_v.length == 0 ? 'bg-pink' : ''}`}
                                                            rows="1" 
                                                            value={m_v}
                                                            onChange={({target}) => updateMedioVerification(m, indexM, indexMV, target)}
                                                        />
                                                        <Show condicion={m.medio_verification.length > 1}>
                                                            <a href="#" className="text-red"
                                                                title="eliminar ítem"
                                                                style={{ position: "absolute", right: "10px", top: "5px" }}
                                                                onClick={(e) => deleteMedioVerification(m, indexM, indexMV)}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </a>
                                                        </Show>
                                                    </div>
                                                </Fragment>
                                            </Show>
                                        </li>
                                    )}
                                </ul>
                            </Show>
                        </td>
                        <td>
                            <div className="btn-group text-center">
                                <Show condicion={!m._edit}>
                                    <button className="btn btn-sm btn-outline-primary"
                                        onClick={(e) => handleEdit(m, indexM)}
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    
                                    <button className="btn btn-sm btn-outline-red"
                                        onClick={(e) => deleteMeta(indexM, m)}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </Show>

                                <Show condicion={m._edit}>
                                    <button className="btn btn-sm btn-outline-success"
                                        onClick={(e) => updateMeta(m, indexM)}
                                    >
                                        <i className="fas fa-save"></i>
                                    </button>
                                    
                                    <button className="btn btn-sm btn-outline-red"
                                        onClick={(e) => handleEdit(m, indexM)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </Show>
                            </div>
                        </td>
                    </tr>    
                )}
            </tbody>
        </table>
    </div>
}

export default AddMetaToActivity;