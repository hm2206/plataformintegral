import React, { useState, useEffect, useContext } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts/AppContext';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import Show from '../show';

const addMetaToPlanTrabajo = ({ plan_trabajo }) => {

    // app
    const app_context = useContext(AppContext);

    // proyecto
    const { project } = useContext(ProjectContext);

    // estados
    const [description, setDescription] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_meta, setCurrentMeta] = useState([]);

    // add meta
    const addMeta = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar el indicador?`, 'Guardar');
        if (answer) {
            app_context.fireLoading(true);
            let datos = {};
            datos.object_id = plan_trabajo.id;
            datos.object_type = 'App/Models/PlanTrabajo';
            datos.description = description;
            await projectTracking.post(`meta`, datos)
                .then(res => {
                    app_context.fireLoading(false);
                    let { success, message, meta } = res.data;
                    if (!success) throw new Error(message);
                    Swal.fire({ icon: 'success', text: message });
                    setDescription("");
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

    // obtener metas
    const getMetas = async (nextPage = 1, up = false) => {
        await projectTracking.get(`plan_trabajo/${plan_trabajo.id}/meta?page=${nextPage}`)
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
        } else {
            obj.description = obj.current_description;
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

    // actualizar datos
    const updateMeta = async (obj, index) => {
        let answer = await Confirm('warning', `¿Deseas actualizar el indicador?`, 'Actualizar');
        if (answer) {
            app_context.fireLoading(true);
            await projectTracking.post(`meta/${obj.id}/update`, obj)
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
        if (plan_trabajo.id) getMetas();
    }, []);

    // render
    return <div className="table-responsive">
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th colSpan="2" className="text-center">Indicadores del plan de trabajo</th>
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
                    <td width="5%">
                        <Button
                            basic
                            color="green"
                            disabled={!description}
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
                                    value={m.description}
                                    onChange={({target}) => handleInput(m, indexM, target)}
                                />
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
                                    
                                    <button className="btn btn-sm btn-outline-red">
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

export default addMetaToPlanTrabajo;